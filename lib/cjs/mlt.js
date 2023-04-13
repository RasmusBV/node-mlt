"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Document = void 0;
const nodes_js_1 = require("./nodes.js");
class Document {
    constructor({ profile = {}, consumer = undefined, filters = [], root = undefined } = {}) {
        this.profile = profile;
        this.consumer = consumer;
        this.filters = filters;
        this.root = root;
    }
    addProfile(profile) {
        this.profile = profile;
    }
    addConsumer(consumer) {
        this.consumer = consumer;
    }
    addFilter(filter) {
        this.filters.push(filter);
    }
    addRoot(root) {
        this.root = root;
    }
    generateDocument() {
        const document = [];
        if (this.profile) {
            const profile = new nodes_js_1.Node("profile", this.profile);
            document.push(profile.getXML().flat());
        }
        if (this.root) {
            const nodeMap = Document.nodeCrawler(this.root);
            const linkableElements = Array.from(nodeMap.values());
            for (const [child, parents] of linkableElements) {
                if (parents.size > 1) {
                    document.push(child.getXML({}).flat());
                }
            }
            document.push(this.root.getXML({}).flat());
        }
        for (const filter of this.filters) {
            document.push(filter.getXML({}).flat());
        }
        if (this.consumer) {
            document.push(this.consumer.getXML({}).flat());
        }
        const xml = ['<?xml version="1.0" encoding="utf-8"?>', '<mlt>', document, '</mlt>'];
        return Document.indenter(xml).join("");
    }
    static indenter(xmlString, doc = [], indent = 0) {
        xmlString.forEach((value) => {
            if (typeof value === "string") {
                doc.push("    ".repeat(indent) + value + "\n");
            }
            else {
                doc = Document.indenter(value, doc, indent + 1);
            }
        });
        return doc;
    }
    ;
    static nodeCrawler(node, map = new Map()) {
        for (const { element: child } of node.children) {
            if ("linked" in child) {
                if (map.has(child.id.id)) {
                    map.get(child.id.id)[1].add(node);
                }
                else {
                    map.set(child.id.id, [child, new Set([node])]);
                }
            }
            if ("children" in child) {
                Document.nodeCrawler(child, map);
            }
        }
        return map;
    }
}
exports.Document = Document;
