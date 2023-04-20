import { Timestamp, Node, XMLString, ParentNode, LinkableParentNode } from './nodes'

import { Producer, Filter, Consumer, Tractor, Playlist } from './external'

export type Producers = Producer | Playlist | Tractor
export type Track = {element: Producers, context: {timestamp?: Timestamp}}
export type Entry = Track|{element: Node<"blank">}

export function* XMLIndenter(xmlString: XMLString, indent = 4,i = 0): Generator<string, void, undefined> {
    for(const value of xmlString) {
        if (typeof value === "string") {
            yield " ".repeat(i*indent) + value + "\n"
        } else {
            yield* XMLIndenter(value, indent, i + 1)
        }
    }
}

export class Document {
    private profile: Record<string, string | number>
    private consumer: Consumer | undefined
    private filters: Filter[]
    private root: Producers | undefined
    constructor({profile= {}, consumer = undefined, filters = [], root = undefined}: {profile?: Record<string, string | number>, consumer?: Consumer, filters?: Filter[], root?: Producer} = {}) {
        this.profile = profile
        this.consumer = consumer
        this.filters = filters
        this.root = root
    }
    addProfile(profile: Record<string, string | number>) {
        this.profile = profile
    }
    addConsumer(consumer: Consumer) {
        this.consumer = consumer
    }
    addFilter(filter: Filter) {
        this.filters.push(filter)
    }
    addRoot(root: Producers) {
        this.root = root
    }
    generateXML() {
        const document: XMLString = []
        if(Object.entries(this.profile).length !== 0) {
            const profile = new Node("profile", this.profile)
            document.push(profile.getXML())
        }
        if(this.root) {
            const nodeMap = Document.nodeCrawler(this.root)
            const linkableElements = Array.from(nodeMap.values())

            //For any child which has more than 1 parent
            //Generates XML for that node at the top of the document for linking
            for(const [child, parents] of linkableElements) {
                if(parents.size > 1) {
                    document.push(child.getXML({}))
                }
            }
            document.push(this.root.getXML({}))
        }
        for(const filter of this.filters) {
            document.push(filter.getXML({}))
        }
        if(this.consumer) {
            document.push(this.consumer.getXML({}))
        }
        return ['<?xml version="1.0" encoding="utf-8"?>', '<mlt>', document, '</mlt>']
    }
    generateDocumentString(indent = 4) {
        const xml = this.generateXML()
        const document: string[] = []
        const generator = XMLIndenter(xml, indent)
        for(const line of generator) {
            document.push(line)
        }
        return document.join("")
    }
    private static nodeCrawler(node: ParentNode<any> | LinkableParentNode<any>, map: Map<string, [child: ParentNode<any> | LinkableParentNode<any>, parents: Set<ParentNode<any> | LinkableParentNode<any>>]> = new Map()) {
        for(const {element: child} of node.children) {
            if("linked" in child) {
                if(map.has(child.id.id)) {
                    map.get(child.id.id)![1].add(node)
                } else {
                    map.set(child.id.id, [child, new Set([node])])
                }
            }
            if("children" in child) {
                Document.nodeCrawler(child, map)
            }
        }
        return map
    }
}