import { randomBytes } from 'crypto'

export type XMLString = (string | XMLString)[]
export type Timestamp = {in?: number, out?: number}
export type Context = {timestamp?: Timestamp, children?: ChildElement[]}
export type ChildElement = ({element: {node: ParentNode | LinkableParentNode}, context: Context}|{element: {node: Node}})

export class Node {
    name: string
    attributes: Record<string, string | number>
    value: string | number | undefined
    constructor(name: string, attributes: Record<string, string | number>, value?: string | number) {
        this.name = name
        this.attributes = attributes
        this.value = value
    }
    getXML(): XMLString {
        if(this.value !== undefined) {
            return [`<${this.name}${Node.getAttributeTags(this.attributes)}>${this.value}</${this.name}>`]
        } else {
            return [`<${this.name}${Node.getAttributeTags(this.attributes)}/>`]
        }
    }
    private static getAttributeTags(attributes: Record<string, string | number>) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
    }
    static mapPropertiesToNodes(properties: Record<string, string | number>) {
        const nodes: ChildElement[] = Array(Object.entries(properties).length).fill(null)
        let i = 0
        for(const property in properties) {
            nodes[i] = {element: new Property(property, properties[property])}
        }
        return nodes
    }
}

export class ParentNode {
    name: string
    timestamp: Timestamp
    children: ChildElement[]
    linkName: string | undefined
    id: Record<string, string> = {}
    constructor(name: string, children: ChildElement[], timestamp: Timestamp = {}, linkName?: string) {
        this.name = name
        this.timestamp = timestamp
        this.children = children
        this.linkName = linkName
        this.id = {id: name + "_" + randomBytes(4).toString('hex')}
    }
    getXML({timestamp = undefined, children=[]}: Context = {}): XMLString {
        const availableTimestamp: Record<string, string | number> = timestamp ? timestamp : this.timestamp
        const open = `<${this.name}${ParentNode.getAttributeTags({...availableTimestamp, ...this.id})}>`
        const close = `</${this.name}>`
        const childXML: XMLString[] = Array(children.length + this.children.length).fill(null)
        for(let i = 0; i < children.length; i++) {
            const child = children[i]
            childXML[i] = ParentNode.getChildXML(child, this.linkName)
        }
        for(let i = 0; i < this.children.length; i++) {
            const child = this.children[i]
            childXML[i+children.length] = ParentNode.getChildXML(child, this.linkName)
        }
        return [open, childXML.flat(), close]
    }
    static getAttributeTags(attributes: Record<string, string | number>) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
    }
    static getChildXML(child: ChildElement, linkName: string | undefined) {
        if("context" in child) {
            return child.element.node.getXML(child.context, linkName)
        } else {
            return child.element.node.getXML()
        }
    }
}

export class LinkableParentNode extends ParentNode {
    linked = false
    constructor(name: string, children: ChildElement[], timestamp: Timestamp = {}, linkName?: string) {
        super(name, children, timestamp, linkName)
    }
    getXML({timestamp = undefined, children=[]}: Context = {}, linkName?: string): XMLString {
        if(!this.linked) {
            this.linked = true
            return super.getXML({timestamp, children})
        }
        if(!linkName) {
            throw new Error("Cannot link, no linkName provided") //This is so sad
        }
        const trueTimestamp = timestamp || {}
        return [`<${linkName} ${ParentNode.getAttributeTags({producer: this.id.id, ...trueTimestamp})}/>`]
    }
}

export class Service {
    node: LinkableParentNode
    constructor(name: string, mlt_service: string, properties: Record<string, string | number>, timestamp?: Timestamp) {
        const children = Node.mapPropertiesToNodes(properties)
        children.push({element: new Property("mlt_service", mlt_service)})
        this.node = new LinkableParentNode(name, children, timestamp)    
    }
    pushProperty(name: string, value: string | number) {
        this.node.children.push({element: new Property(name, value)})
        return this
    }
    
}

export class Property {
    node: Node
    constructor(name: string, value: string | number) {
        this.node = new Node("property", {name}, value)
    }
}