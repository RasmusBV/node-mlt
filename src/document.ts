import { Timestamp, Node, XMLString, ParentNode, LinkableParentNode } from './nodes'

import { Producer, Filter, Consumer, Tractor, Playlist } from './external'

export type Producers = Producer | Playlist | Tractor

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
    constructor({profile= {}, consumer = undefined, filters = [], root = undefined}: {profile?: Record<string, string | number>, consumer?: Consumer, filters?: Filter[], root?: Producers} = {}) {
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
            const linkableElements = Array.from(nodeMap.entries()).sort((a, b) => b[1][1]-a[1][1])
            //For any child which has more than 1 parent
            //Generates XML for that node at the top of the document for linking
            for(const [child, [parents]] of linkableElements) {
                if(parents > 1) {
                    console.log([child, parents])
                    document.push(child.getXML())
                }
            }
            document.push(this.root.node.getXML())
        }
        for(const filter of this.filters) {
            document.push(filter.node.getXML())
        }
        if(this.consumer) {
            document.push(this.consumer.node.getXML())
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
    /**
     * Crawls the Node graph and maps all linkable nodes with info about number of parents and how far out in the graph they are
     * @param root Root Node of the Document
     * @returns map of all linkable nodes with number of parents and when it was last explored
     */
    private static nodeCrawler(root: ParentNode | LinkableParentNode) {
        const queue: (ParentNode | LinkableParentNode | Node)[] = [root]
        const map: Map<ParentNode | LinkableParentNode, [parents: number, lastExplored: number]> = new Map()
        let i = 0
        while(queue.length) {
            const node = queue.shift()!
            if("linked" in node) {
                if(map.has(node)) {
                    const nodeInfo = map.get(node)!
                    nodeInfo[0]++
                    nodeInfo[1] = i
                } else {
                    map.set(node, [1, i])
                }
            }
            if("children" in node) {
                for(const child of node.children) {
                    queue.push(child.node)
                }
            }
            i++
        }
        return map
    }
}