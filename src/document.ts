import { Timestamp, Node, XMLString, ParentNode, LinkableParentNode } from './nodes'

import { Producer, Filter, Consumer, Tractor, Playlist } from './external'

export type Producers = Producer | Playlist
export type Track = {element: Producers, context: {timestamp?: Timestamp}}

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
            const nodeMap = Document.nodeCrawler(this.root.node)
            const linkableElements = Array.from(nodeMap.values())

            //For any child which has more than 1 parent
            //Generates XML for that node at the top of the document for linking
            for(const [child, parents] of linkableElements) {
                if(parents.size > 1) {
                    document.push(child.getXML({}))
                }
            }
            document.push(this.root.node.getXML({}))
        }
        for(const filter of this.filters) {
            document.push(filter.node.getXML({}))
        }
        if(this.consumer) {
            document.push(this.consumer.node.getXML({}))
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
    private static nodeCrawler(node: ParentNode | LinkableParentNode, map: Map<string, [child: ParentNode | LinkableParentNode, parents: Set<ParentNode | LinkableParentNode>]> = new Map()) {
        for(const {element: child} of node.children) {
            if("linked" in child.node) {
                if(map.has(child.node.id.id)) {
                    map.get(child.node.id.id)![1].add(node)
                } else {
                    map.set(child.node.id.id, [child.node, new Set([node])])
                }
            }
            if("children" in child.node) {
                Document.nodeCrawler(child.node, map)
            }
        }
        return map
    }
}