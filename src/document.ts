import { Node, XMLString, ParentNode, LinkableParentNode } from './nodes'
import { Producer, Filter, Consumer, Tractor, Playlist } from './external'
import { createWriteStream } from 'fs'
import { mkdtemp, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'

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

type ParentLink = {node: LinkableParentNode | ParentNode, parent: ParentLink | undefined}

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
        return this
    }
    addConsumer(consumer: Consumer) {
        this.consumer = consumer
        return this
    }
    addFilter(filter: Filter) {
        this.filters.push(filter)
        return this
    }
    addRoot(root: Producers) {
        this.root = root
        return this
    }
    generateXML() {
        const document: XMLString = ['<?xml version="1.0" encoding="utf-8"?>', '<mlt>']
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
                    document.push(child.getXML())
                }
            }
            document.push(this.root.node.getXML())

            //Unlink all nodes for future document creation
            for(const [child] of linkableElements) {
                child.linked = false
            }
        }
        for(const filter of this.filters) {
            document.push(filter.node.getXML())
        }
        if(this.consumer) {
            document.push(this.consumer.node.getXML())
        }
        document.push('</mlt>')
        return document
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
        const queue: ParentLink[] = [{node: root, parent: undefined}]
        const map: Map<LinkableParentNode, [parents: number, lastExplored: number]> = new Map()

        let i = 0
        while(queue.length) {
            const parentLink = queue.shift()!
            const children = this.handleNode(parentLink, map, i)
            queue.push(...children)
            i++
        }
        return map
    }
    private static handleNode(parentLink: ParentLink, map: Map<LinkableParentNode, [parents: number, lastExplored: number]>, i: number) {
        const {node, parent} = parentLink

        //Add or update counters for this node
        if("linked" in node) {
            if(map.has(node)) {
                const nodeInfo = map.get(node)!
                nodeInfo[0]++
                nodeInfo[1] = i
            } else {
                map.set(node, [1, i])
            }
        }
        const children: ParentLink[] = []
        //Add all children to queue
        if("children" in node) {
            for(const child of node.children) {
                if(!("id" in child.node)) {continue}
                let nextParent = parent
                //Check for circular references
                while(nextParent) {
                    if(nextParent.node === child.node) {throw new Error("Circular Reference")}
                    nextParent = nextParent.parent
                }
                children.push({node: child.node, parent: parentLink})
            }
        }
        return children
    }
    async saveAsXMLDocument(): Promise<{path: string, remove: () => Promise<void>}>
    async saveAsXMLDocument(path: string): Promise<{path: string}>
    async saveAsXMLDocument(path?: string) {
        //Create writeStream to specified path or temp file
        let returnVariable: {path: string, remove?: () => Promise<void>} = {path: ""}
        
        if(path) {
            returnVariable.path = path
        } else {
            const tmp = await mkdtemp(join(tmpdir(), "melt-"))
            returnVariable.path = join(tmp, "temp.mlt")
            returnVariable.remove = () => rm(tmp, {recursive: true})
        }
        const stream = createWriteStream(returnVariable.path, {flags: "a"})
        
        //Write to stream
        const xml = XMLIndenter(this.generateXML())
        return new Promise((resolve: (value: {path: string, remove?: () => Promise<void>}) => void, reject) => {
            stream.on("ready", () => {
                let value = xml.next()
                while(!value.done) {
                    const line = value.value
                    stream.write(line)
                    value = xml.next()
                }
                stream.write("", () => {
                    stream.close(() => {
                        resolve(returnVariable)
                    })
                })
            })
            stream.on("error", (e) => reject(e))
        })
    }
}