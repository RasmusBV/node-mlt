import { NodeBuilder } from "../mlt.js";
function Profile(attributes) {
    return {
        name: "profile",
        getXML: () => NodeBuilder.getElementTags("profile", attributes, true)
    };
}
export var Root;
(function (Root) {
    class Builder {
        profile;
        filters = [];
        consumer;
        addGlobalFilter(filter) {
            this.filters.push(filter);
        }
        addProfile(profile) {
            this.profile = Profile(profile);
        }
        addConsumer(consumer) {
            this.consumer = consumer;
        }
        createDocument(node) {
            const elementMap = new Map();
            (function traverser(parent) {
                for (const { node: child } of parent.children) {
                    if (("id" in child)) {
                        if (elementMap.has(child.id)) {
                            elementMap.get(child.id)[1].add(parent);
                        }
                        else {
                            elementMap.set(child.id, [child, new Set([parent])]);
                        }
                    }
                    if ("children" in child) {
                        traverser(child);
                    }
                }
            })(node);
            const elements = Array.from(elementMap.values());
            const document = new NodeBuilder("mlt");
            if (this.profile) {
                document.addChild({ node: this.profile, context: {} });
            }
            for (let i = 0; i < elements.length; i++) {
                const [child, parents] = elements[i];
                if (parents.size > 1) {
                    document.addChild({ node: child, context: {} });
                }
            }
            document.addChild({ node, context: {} });
            for (const filter of this.filters) {
                document.addChild({ node: filter, context: {} });
            }
            if (this.consumer) {
                document.addChild({ node: this.consumer, context: {} });
            }
            const indenter = (xmlString, doc = [], indent = 0) => {
                xmlString.forEach((value) => {
                    if (typeof value === "string") {
                        doc.push("    ".repeat(indent) + value + "\n");
                    }
                    else {
                        doc = indenter(value, doc, indent + 1);
                    }
                });
                return doc;
            };
            return indenter(['<?xml version="1.0" encoding="utf-8"?>', ...document.build(() => { return {}; }).getXML({})]).join("");
        }
    }
    Root.Builder = Builder;
})(Root || (Root = {}));
