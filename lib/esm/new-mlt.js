import { randomBytes } from 'crypto';
export class Node {
    name;
    attributes;
    value;
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
export class ParentNode {
    name;
    timestamp;
    children;
    linkName;
    id = {};
    constructor(name, children, timestamp = {}, linkName, id) {
        this.name = name;
        this.timestamp = timestamp;
        this.children = children;
        this.linkName = linkName;
        if (id) {
            this.id = { id };
        }
    }
    getXML({ timestamp = undefined, children = [] }) {
        const availableTimestamp = timestamp ? timestamp : this.timestamp;
        const open = `<${this.name}${ParentNode.getAttributeTags({ ...availableTimestamp, ...this.id })}>`;
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
export class LinkableParentNode extends ParentNode {
    linked = false;
    id;
    constructor(name, children, timestamp = {}, linkName) {
        const id = name + "_" + randomBytes(4).toString('hex');
        super(name, children, timestamp, linkName, id);
        this.id = { id };
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
        return [`<${linkName} ${ParentNode.getAttributeTags({ producer: this.id.id, ...trueTimestamp })}/>`];
    }
}
