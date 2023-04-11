import { NodeBuilder, LinkableNode, ParentNode, Node, Track } from "../mlt.js";
import { Filter } from "./services/filter.js";
import { Consumer } from "./services/consumer.js"

type Profile = Node<"profile", {}>

function Profile(attributes: Record<string, string | number>): Profile {
    return {
        name: "profile",
        getXML: () => NodeBuilder.getElementTags("profile", attributes, true)
    }
}

export namespace Root {
    export class Builder {
        private profile: Profile | undefined
        private filters: Filter[] = []
        private consumer: Consumer | undefined
        addGlobalFilter(filter: Filter) {
            this.filters.push(filter)
        }
        addProfile(profile: Record<string, string | number>) {
            this.profile = Profile(profile)
        }
        addConsumer(consumer: Consumer) {
            this.consumer = consumer
        }
        createDocument(node: Track) {
            const elementMap: Map<string, [child: LinkableNode<any, any, any>, parents: Set<ParentNode<any, any, any>>]> = new Map()
            ;(function traverser(parent: ParentNode<any, any, any>) {
                for(const {node: child} of parent.children) {
                    
                    if(("id" in child)) {
                        if(elementMap.has(child.id)) {
                            elementMap.get(child.id)![1].add(parent)
                        } else {
                            elementMap.set(child.id, [child, new Set([parent])])
                        }
                    }
                    if("children" in child) {
                        traverser(child)
                    }
                    
                }
            })(node as LinkableNode<any, any, any>)

            const elements = Array.from(elementMap.values())
            const document = new NodeBuilder<"mlt",{},  Profile | LinkableNode<any, any, any> | Filter>("mlt")
            if(this.profile) {document.addChild(
                {node: this.profile, context: {}}
            )}

            for(let i = 0; i < elements.length; i++) {
                const [child, parents] = elements[i]
                if(parents.size > 1) {
                    document.addChild({node: child, context: {}})
                }
            }
            document.addChild({node, context: {}})
            for(const filter of this.filters) {
                document.addChild({node: filter, context: {}})
            }
            if(this.consumer) {document.addChild({node: this.consumer, context: {}})}
            const indenter = (xmlString: NodeBuilder.XMLString, doc: string[] = [], indent = 0) => {
                xmlString.forEach((value) => {
                    if(typeof value === "string") {
                        doc.push("    ".repeat(indent) + value + "\n")
                    } else {
                        doc = indenter(value, doc, indent+1)
                    }
                })
                return doc
            }
            return indenter(['<?xml version="1.0" encoding="utf-8"?>', ...document.build(() => {return {}}).getXML({})]).join("")
        }
    }
}