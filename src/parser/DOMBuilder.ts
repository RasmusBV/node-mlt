import * as sax from 'sax'
import { EventEmitter } from 'events'

const LeafElements = [
    "property",
    "entry",
    "track",
    "blank"
] as const
export type LeafElement = typeof LeafElements[number]

const ServiceElements = [
    "producer",
    "transition",
    "filter",
    "consumer"
] as const
export type ServiceElement = typeof ServiceElements[number]

const BlockElements = [
    "playlist",
    "multitrack",
    "tractor",
    "mlt"
] as const
export type BlockElement = typeof BlockElements[number]


type ValidElement = BlockElement | ServiceElement | LeafElement


//Incomplete... But parsing compact form XML seems like a headache
const ValidChildren = {
    producer:   ["property"],
    transition: ["property"],
    filter:     ["property"],
    consumer:   ["property"],

    playlist:   ["entry", "blank", "producer", "playlist", "tractor"],
    multitrack: ["track", "producer", "playlist", "tractor"],
    tractor:    ["multitrack", "filter", "transition"],
    mlt:        ["producer", "playlist", "tractor", "consumer", "filter"]
} as const

type ValidChildren<T extends ServiceElement | BlockElement> = typeof ValidChildren[T][number]

const ValidAttributes = {
    property: {
        value:          {int: false, opt: false},
        name:           {int: false, opt: false}
    },
    entry:      {
        producer:       {int: false, opt: false}, 
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true }
    },
    track:      {
        producer:       {int: false, opt: false}, 
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true }
    },
    blank:      {
        length:         {int: true,  opt: false}
    },

    producer:   {
        mlt_service:    {int: false, opt: false},
        id:             {int: false, opt: true },
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true }
    },
    transition: {
        mlt_service:    {int: false, opt: false},
        id:             {int: false, opt: true },
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true },
        a_track:        {int: true,  opt: false},
        b_track:        {int: true,  opt: false}
    },
    filter:     {
        mlt_service:    {int: false, opt: false},
        id:             {int: false, opt: true },
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true },
        track:          {int: true,  opt: true } //Since it can be used globally it is optional
    },
    consumer:   {
        mlt_service:    {int: false, opt: false},
        id:             {int: false, opt: true },
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true }
    },

    playlist:   {
        id:             {int: false, opt: true },
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true }
    },
    multitrack: {
        id:             {int: false, opt: true }
    },
    tractor:    {
        id:             {int: false, opt: true },
        in:             {int: true,  opt: true }, 
        out:            {int: true,  opt: true }
    },
    mlt:        {}
} as const

type ValidAttributes<T extends ValidElement> = typeof ValidAttributes[T]

type AttributeType<T> = T extends {int: true} ? number : string


//Sheesh some type declarations 💀
type FinishedAttributes<T extends ValidElement> = Partial<{
    -readonly [P in keyof ValidAttributes<T> as ValidAttributes<T>[P] extends {opt: true} ? P : never]: AttributeType<ValidAttributes<T>[P]>
}> & {
    -readonly [P in keyof ValidAttributes<T> as ValidAttributes<T>[P] extends {opt: false} ? P : never]: AttributeType<ValidAttributes<T>[P]>
}

type FinishedElementBase<T extends ValidElement> = {
    name: T,
    attributes: FinishedAttributes<T>
}

export type FinishedLeafElement<T extends LeafElement> = FinishedElementBase<T>

export type FinishedParentElement<T extends ServiceElement | BlockElement> = {
    children: FinishedElement<ValidChildren<T>>[]
} & FinishedElementBase<T>

export type FinishedElement<T extends ValidElement = ValidElement> = T extends LeafElement ? FinishedLeafElement<T> : T extends ServiceElement | BlockElement ? FinishedParentElement<T> : never

class ServiceConstructor {
    private parser: ParserWrapper
    private expectText: {expect: false} | {expect: true, name: string} = {expect: false}
    private tagName: ServiceElement
    private attributesAndProperties: Record<string, string>
    private callback: (service: FinishedParentElement<ServiceElement>) => void
    constructor(parserWrapper: ParserWrapper, tag: sax.Tag, callback: (service: FinishedParentElement<ServiceElement>) => void) {
        this.parser = parserWrapper
        parserWrapper.bind(this)
        if(!this.parser.isServiceElementName(tag.name)) {
            this.parser.parserError("Cannot instantiate ServiceConstructor when tag name is not the name of a service")
        }
        this.tagName = tag.name as ServiceElement
        this.attributesAndProperties = tag.attributes
        this.callback = callback
    }
    onopentag(tag: sax.Tag) {
        if(this.expectText.expect) {
            this.parser.parserError("Found opentag when expecting text")
        }
        if(tag.name !== "property") {
            this.parser.parserError(`invalid child element: "${tag.name}" found inside: "${this.tagName}"`)
        }
        if(!("name" in tag.attributes)) {
            this.parser.parserError(`Invalid Property structure. Properties must have a "name" attribute`)
        }
        for(const key in tag.attributes) {
            if(key !== "name" && key !== "value") {
                this.parser.parserError(`Unknown attribute: "${key}: ${tag.attributes[key]}" found in property`)
            }
        }
        let name = tag.attributes.name
        let value = "value" in tag.attributes ? tag.attributes.value : undefined
        
        if(!value) {
            this.expectText = {expect: true, name}
        } else {
            this.attributesAndProperties[name] = value
        }
    }
    ontext(text: string) {
        if(!this.expectText.expect) {
            if(this.parser.textContainsTag(text)) {
                this.parser.parserError(`Unexpected Tag: ${text}`)
            } else {
                this.parser.parserError(`Unexpected Text: ${text}`)
            }
        } else {
            this.attributesAndProperties[this.expectText.name] = text
        }
        this.expectText = {expect: false}
    }
    onclosetag(tag: string) {
        if(this.expectText.expect) {
            this.parser.parserError("Found closetag when expecting text")
        }
        if(tag === this.tagName) {
            const {attributes, properties} = this.constructAttributesAndProperties()
            const propertyElements: FinishedElement<"property">[] = Object.entries(properties).map(([name, value]) => {
                return {name: "property", attributes: {name, value}}
            })
            this.callback({name: this.tagName, attributes, children: propertyElements} as FinishedElement<ServiceElement>)
        }
    }
    constructAttributesAndProperties() {
        const requiredAttributes = Object.entries(ValidAttributes[this.tagName])
            .filter(([_, {opt}]) => !opt)
            .map(([key]) => key)
        
        const containsRequiredAttributes = requiredAttributes
            .every((value) => Object.keys(this.attributesAndProperties).includes(value))
        if(!containsRequiredAttributes) {
            this.parser.parserError(`Service ${this.tagName} does not contain all required attributes.\nAttributes and Properties on service: ${Object.keys(this.attributesAndProperties)}\nRequired attributes: ${requiredAttributes}`)
        }
        const parsedAttributes: Record<string, string | number> = {}
        const properties: Record<string, string> = {}
        for(const attributeOrProperty in this.attributesAndProperties) {
            const value = this.attributesAndProperties[attributeOrProperty]
            if(attributeOrProperty in ValidAttributes[this.tagName]) {
                const {int} = ValidAttributes[this.tagName][(attributeOrProperty as keyof ValidAttributes<typeof this.tagName>)] as {int: boolean}
                const attributeValue = int ? this.parser.integerParser(value) : value
                parsedAttributes[attributeOrProperty] = attributeValue
            } else {
                properties[attributeOrProperty] = value
            }
        }
        return {attributes: parsedAttributes, properties} as {attributes: FinishedAttributes<ServiceElement>, properties: Record<string, string>}
    }
}

export class DOMBuilder extends EventEmitter {
    private parser: ParserWrapper

    private stack: FinishedElement[] = []
    private DOM: FinishedElement<"mlt"> = {name: "mlt", children: [], attributes: {}}

    //State varaibles
    private foundRoot = false
    private constructingService: {value: false} | {value: true, service: string} = {value: false}

    constructor() {
        super()
        this.parser = new ParserWrapper(this)
        this.parser.parser.onerror = (e) => this.emit("error", e)
        this.parser.bind(this)
    }
    async parse(XML: string) {
        this.parser.parser.write(XML)
    }
    handleRootElement(tag: sax.Tag | sax.QualifiedTag) {
        if(tag.name !== "mlt") {
            this.parser.parserError("Root element should be <mlt>...</mlt>.")
        }
        if(tag.isSelfClosing === true) {
            this.parser.parserError("Root element should not be self closing.")
        }
        if(Object.keys(tag.attributes).length !== 0) {
            this.parser.parserError("Root element should have no attributes")
        }
        if(this.foundRoot) {
            this.parser.parserError("Only one Root Element is allowed")
        }
        this.foundRoot = true
        
        //This is to make the stack and DOM refer to the same object for mutating them both
        const root:FinishedElement<"mlt"> = {name: "mlt", children: [], attributes: {}}
        this.stack.push(root)
        this.DOM = root
        return
    }
    onopentag(tag: sax.Tag) {
        //Special case for the root element
        if(this.stack.length === 0) {
            this.handleRootElement(tag)
            return
        }
        const lastTag = this.stack[this.stack.length-1]
        const tagName = tag.name
        this.parser.assertValidBlockElement(lastTag)
        this.parser.assertValidChildElementName(lastTag, tagName)
        lastTag.name
        if(this.parser.isServiceElementName(tagName)) {
            new ServiceConstructor(this.parser, tag, (service) => {
                lastTag.children.push(service as never) //some cursed type assertion but whatever
                this.parser.bind(this)
            })
            return
        } 
        let node: FinishedElement
        if(this.parser.isBlockElementname(tagName)) {
            node = {name: tagName, attributes: this.constructAttributes(tagName, tag.attributes), children: []} as FinishedElement<"playlist" | "tractor" | "multitrack">
        } else {
            node = {name: tagName, attributes: this.constructAttributes(tagName, tag.attributes)} as FinishedElement<"blank" | "entry" | "track">
        }
        this.stack.push(node)
        lastTag.children.push(node as never) //The same little hack i guess
    }
    constructAttributes<T extends ValidElement>(tag: T, attributes: Record<string, string>) {
        const requiredAttributes = Object.entries(ValidAttributes[tag])
            .filter(([_, value]) => !value.opt)
            .map(([key]) => key)
        
        const containsRequiredAttributes = requiredAttributes
            .every((value) => Object.keys(attributes).includes(value))
        
        if(!containsRequiredAttributes) {
            this.parser.parserError(`Element ${tag} does not contain all required attributes.\nAttributes and Properties on element: ${Object.keys(attributes)}\nRequired attributes: ${requiredAttributes}`)
        }
        const parsedAttributes: Record<string, string | number> = {}
        for(const attribute in attributes) {
            const value = attributes[attribute]
            if(attribute in ValidAttributes[tag]) {
                const {int} = ValidAttributes[tag][(attribute as keyof ValidAttributes<T>)] as {int: boolean}
                const attributeValue = int ? this.parser.integerParser(value) : value
                parsedAttributes[attribute] = attributeValue
            } else {
                this.parser.parserError(`Unknown attribute: "${attribute}" found in: "${tag}"`)
            }
        }
        return parsedAttributes as FinishedAttributes<T>
    }

    onclosetag(tag: string) {
        this.stack.pop()
        if(tag === "mlt") {
            process.nextTick(() => this.emit("end", this.DOM))
        }
    }

    ontext(text: string) {
        if(this.parser.textContainsTag(text)) {
            this.parser.parserError(`Unexpected Tag: ${text}`)
        } else {
            this.parser.parserError(`Unexpected Text: ${text}`)
        }
    }
}

interface ParserCallbacks {
    onopentag(tag: sax.Tag): void
    onclosetag(tagName: string): void
    ontext(t: string): void
}

class ParserWrapper {
    parser: sax.SAXParser
    errorBinding: EventEmitter
    constructor(errorBinding: EventEmitter) {
        this.parser = this.parser = sax.parser(true, {
            trim: true,
            normalize: true,
            position: true
        })
        this.errorBinding = errorBinding
    }
    bind(callbacks: ParserCallbacks) {
        this.parser.onopentag = callbacks.onopentag.bind(callbacks)
        this.parser.onclosetag = callbacks.onclosetag.bind(callbacks)
        this.parser.ontext = callbacks.ontext.bind(callbacks)
    }
    parserError(error: string) {
        const line = this.parser.line
        const column = this.parser.column
        this.errorBinding.emit("error", new Error(`${error}\nEncountered at line: ${line}, column: ${column}\n`))
    }
    textContainsTag(text: string) {
        const openTag = text.indexOf("<")
        const closeTag = text.indexOf(">")
        if(openTag === -1 || closeTag === -1) {return false}
        if(closeTag > openTag) {return true}
        return false
    }
    integerParser(input: string) {
        if(input.length === 0) {this.parserError("Empty string where integer was expected")}
        for(let i = 0; i < input.length; i++) {
            if(!"0123456789".includes(input[i])) {this.parserError("Integer was expected")}
        }
        return parseInt(input)
    }
    isServiceElementName(name: string): name is ServiceElement {
        if((ServiceElements as readonly string[]).includes(name)) {
            return true
        }
        return false
    }
    isBlockElementname(name: string): name is BlockElement {
        if((BlockElements as readonly string[]).includes(name)) {
            return true
        }
        return false
    }
    assertValidChildElementName<T extends FinishedParentElement<BlockElement>>(parent: T, child: string): asserts child is ValidChildren<typeof parent.name> {
        if(!(ValidChildren[parent.name] as readonly string[]).includes(child)) { //Wtf is this type definition on .includes()??
            this.parserError(`Invalid Child Element.\n"${child}" cannot be child of "${parent.name}"`)
        }
    }
    assertValidBlockElement(parent: FinishedElement): asserts parent is FinishedElement<BlockElement> {
        if(!this.isBlockElementname(parent.name)) {
            this.parserError(`Invalid Child Element.\n"${parent.name}" cannot have any children`)
        }
    }
}