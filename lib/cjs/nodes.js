"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = exports.LinkableParentNode = exports.ParentNode = exports.Node = void 0;
const crypto_1 = require("crypto");
class Node {
    constructor(name, attributes, value) {
        this.name = name;
        this.attributes = attributes;
        this.value = value;
    }
    getXML() {
        if (this.value !== undefined) {
            return [`<${this.name}${Node.getAttributeTags(this.attributes)}>${this.value}</${this.name}>`];
        }
        else {
            return [`<${this.name}${Node.getAttributeTags(this.attributes)}/>`];
        }
    }
    static getAttributeTags(attributes) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ");
    }
    static Property(name, value) {
        return new Node("property", { name }, value);
    }
    static mapPropertiesToNodes(properties) {
        console.log();
        const nodes = Array(Object.entries(properties).length).fill(null);
        let i = 0;
        for (const property in properties) {
            nodes[i] = { element: Node.Property(property, properties[property]) };
        }
        return nodes;
    }
}
exports.Node = Node;
class ParentNode {
    constructor(name, children, timestamp = {}, linkName) {
        this.id = {};
        this.name = name;
        this.timestamp = timestamp;
        this.children = children;
        this.linkName = linkName;
        this.id = { id: name + "_" + (0, crypto_1.randomBytes)(4).toString('hex') };
    }
    getXML({ timestamp = undefined, children = [] }) {
        const availableTimestamp = timestamp ? timestamp : this.timestamp;
        const open = `<${this.name}${ParentNode.getAttributeTags(Object.assign(Object.assign({}, availableTimestamp), this.id))}>`;
        const close = `</${this.name}>`;
        const childXML = Array(children.length + this.children.length).fill(null);
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            childXML[i] = ParentNode.getChildXML(child, this.linkName);
        }
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i];
            childXML[i + children.length] = ParentNode.getChildXML(child, this.linkName);
        }
        return [open, childXML.flat(), close];
    }
    static getAttributeTags(attributes) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ");
    }
    static getChildXML(child, linkName) {
        if ("context" in child) {
            return child.element.getXML(child.context, linkName);
        }
        else {
            return child.element.getXML();
        }
    }
}
exports.ParentNode = ParentNode;
class LinkableParentNode extends ParentNode {
    constructor(name, children, timestamp = {}, linkName) {
        super(name, children, timestamp, linkName);
        this.linked = false;
    }
    getXML({ timestamp = undefined, children = [] }, linkName) {
        if (!this.linked) {
            this.linked = true;
            return super.getXML({ timestamp, children });
        }
        if (!linkName) {
            throw new Error("Cannot link, no linkName provided"); //This is so sad
        }
        const trueTimestamp = timestamp || {};
        return [`<${linkName} ${ParentNode.getAttributeTags(Object.assign({ producer: this.id.id }, trueTimestamp))}/>`];
    }
}
exports.LinkableParentNode = LinkableParentNode;
class Service extends ParentNode {
    constructor(name, mlt_service, properties, timestamp) {
        const children = Node.mapPropertiesToNodes(properties);
        children.push({ element: Node.Property("mlt_service", mlt_service) });
        super(name, children, timestamp);
    }
    addProperty(name, value) {
        this.children.push({ element: Node.Property(name, value) });
        return this;
    }
}
exports.Service = Service;
