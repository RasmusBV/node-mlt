import { Timestamp, Node, XMLString, ParentNode, LinkableParentNode } from './nodes.js'

import { Producer } from './nodes/producer.js'
import { Playlist } from './nodes/playlist.js'
import { Tractor } from './nodes/tractor.js'
import { Consumer } from './nodes/consumer.js'
import { Filter } from './nodes/filter.js'

export type Producers = Producer | Playlist | Tractor
export type Track = {element: Producers, context: {timestamp?: Timestamp}}
export type Entry = Track|{element: Node<"blank">}


export class Document {
    private profile: Record<string, string | number>
    private consumer: Consumer | undefined
    private filters: Filter[]
    private root: Producer | undefined
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
    addRoot(root: Producer) {
        this.root = root
    }
    generateDocument() {
        const document: XMLString = []
        if(this.profile) {
            const profile = new Node("profile", this.profile)
            document.push(profile.getXML().flat())
        }
        if(this.root) {
            const nodeMap = Document.nodeCrawler(this.root)
            const linkableElements = Array.from(nodeMap.values())
            for(const [child, parents] of linkableElements) {
                if(parents.size > 1) {
                    document.push(child.getXML({}).flat())
                }
            }
            document.push(this.root.getXML({}).flat())
        }
        for(const filter of this.filters) {
            document.push(filter.getXML({}).flat())
        }
        if(this.consumer) {
            document.push(this.consumer.getXML({}).flat())
        }
        const xml = ['<?xml version="1.0" encoding="utf-8"?>', '<mlt>', document, '</mlt>']
        return Document.indenter(xml).join("")  
    }
    private static indenter(xmlString: XMLString, doc: string[] = [], indent = 0) {
        xmlString.forEach((value) => {
            if (typeof value === "string") {
                doc.push("    ".repeat(indent) + value + "\n");
            }
            else {
                doc = Document.indenter(value, doc, indent + 1);
            }
        });
        return doc;
    };
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