import { randomBytes } from 'crypto'

export type XMLString = (string | XMLString)[]
export type Timestamp = {in?: number, out?: number}
export type ChildElement = ({element: Element, timestamp?: Timestamp, children?: ChildElement[]})

type SimpleElement = {node: Node}
type ParentElement = {node: ParentNode | LinkableParentNode}

export type Element = SimpleElement | ParentElement

function getAttributeTags(attributes: Record<string, string | number>) {
    return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
}

export class Node {
    private name: string
    private attributes: string
    private value: string | number | undefined
    constructor(name: string, attributes: Record<string, string | number>, value?: string | number) {
        this.name = name
        this.attributes = getAttributeTags(attributes)
        this.value = value
    }
    getXML(): XMLString {
        if(this.value !== undefined) {
            return [`<${this.name}${this.attributes}>${this.value}</${this.name}>`]
        } else {
            return [`<${this.name}${this.attributes}/>`]
        }
    }
    static mapPropertiesToNodes(properties: Record<string, string | number>) {
        const nodes: ChildElement[] = Array(Object.entries(properties).length)
        let i = 0
        for(const property in properties) {
            nodes[i] = {element: new Property(property, properties[property])}
        }
        return nodes
    }
}

export class ParentNode {

    //Properties of this Node
    name: string
    private timestamp: Timestamp
    private linkName: string | undefined
    id: string

    //Properties of Child Nodes
    private childElements: Element[]
    private timestamps: Timestamp[]
    private context: ChildElement[][]

    constructor(name: string, children: ChildElement[], timestamp: Timestamp = {}, linkName?: string) {
        this.name = name
        this.timestamp = timestamp
        this.linkName = linkName
        this.id = name + "_" + randomBytes(4).toString('hex')

        this.childElements = new Array(children.length)
        this.timestamps = new Array(children.length)
        this.context = new Array(children.length)
        for(let i = 0; i < children.length; i++) {
            const {element, timestamp = undefined, children: grandChildren = undefined} = children[i]
            this.childElements[i] = element
            if(timestamp) {
                this.timestamps[i] = timestamp
            }
            if(grandChildren) {
                this.context[i] = grandChildren
            }
        }
    }
    getXML({timestamp = undefined, children=[]}: {timestamp?: Timestamp, children?: ChildElement[]} = {}): XMLString {
        const open = `<${this.name}${getAttributeTags({...(timestamp ? timestamp : this.timestamp), id: this.id})}>`
        const close = `</${this.name}>`

        const childXML: XMLString[] = Array(children.length + this.childElements.length)

        for(let i = 0; i < children.length; i++) {
            const {element, timestamp = undefined, children: context = undefined} = children[i]
            childXML[i] = this.getChildXML(element, timestamp, context, this.linkName)
        }

        for(let i = 0; i < this.childElements.length; i++) {
            const element = this.childElements[i]
            const timestamp = this.timestamps[i]
            const context = this.context[i]
            childXML[i+children.length] = this.getChildXML(element, timestamp, context, this.linkName)
        }

        return [open, childXML.flat(), close]
    }

    get children() {
        return this.childElements as readonly Element[]
    }

    addChild(element: Element, timestamp?: Timestamp, children?: ChildElement[]) {
        if(timestamp) {
            this.timestamps[this.childElements.length] = timestamp
        }
        if(children) {
            this.context[this.childElements.length] = children
        }
        this.childElements.push(element)
    }

    private getChildXML(child: Element, timestamp: Timestamp | undefined, children: ChildElement[] | undefined, linkName: string | undefined) {
        return child.node.getXML({timestamp, children}, linkName)
    }
}

export class LinkableParentNode extends ParentNode {
    linked = false
    constructor(name: string, children: ChildElement[], timestamp: Timestamp = {}, linkName?: string) {
        super(name, children, timestamp, linkName)
    }
    getXML({timestamp = undefined, children=[]}: {timestamp?: Timestamp, children?: ChildElement[]} = {}, linkName?: string): XMLString {
        if(!this.linked) {
            this.linked = true
            return super.getXML({timestamp, children})
        }
        if(!linkName) {
            throw new Error("Cannot link, no linkName provided") //This is so sad
        }
        const trueTimestamp = timestamp || {}
        return [`<${linkName} ${getAttributeTags({producer: this.id, ...trueTimestamp})}/>`]
    }
}

export class Service {
    node: ParentNode
    constructor(name: string, mlt_service: string, properties: Record<string, string | number>, timestamp?: Timestamp) {
        const children = Node.mapPropertiesToNodes(properties)
        children.push({element: new Property("mlt_service", mlt_service)})
        this.node = new ParentNode(name, children, timestamp)    
    }
    pushProperty(name: string, value: string | number) {
        this.node.addChild(new Property(name, value))
        return this
    }
    
}

export class Property {
    node: Node
    constructor(name: string, value: string | number) {
        this.node = new Node("property", {name}, value)
    }
}