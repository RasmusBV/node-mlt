"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeBuilder = exports.Property = void 0;
const crypto_1 = require("crypto");
function Property(name, value) {
    return {
        name: "property",
        getXML: () => {
            return [NodeBuilder.getProperty(name, value)];
        }
    };
}
exports.Property = Property;
class NodeBuilder {
    constructor(name, linkName) {
        this.children = [];
        this.timestamp = {};
        this.name = name;
        this.linkName = linkName;
    }
    addChild(child) {
        this.children.push(child);
    }
    addTimestamp(timestamp) {
        this.timestamp = timestamp;
    }
    indexOf(track) {
        for (let i = 0; i < this.children.length; i++) {
            const child = this.children[i].node;
            if (track === child) {
                return i;
            }
        }
        throw new Error('Track not part of this node');
    }
    build(callback, linkable = false) {
        const obj = {
            name: this.name,
            children: this.children
        };
        const id = linkable ? this.name + "_" + (0, crypto_1.randomBytes)(4).toString('hex') : undefined;
        let linked = false;
        const obj2 = Object.assign(Object.assign({}, obj), { getXML: (context) => {
                const { children = [], timestamp = {} } = callback(context);
                if (linked && id) {
                    const { linkName = undefined } = context;
                    return this.link(id, NodeBuilder.assertTimestamp(timestamp), linkName);
                }
                linked = true;
                const assertedTimestamp = NodeBuilder.assertTimestamp(timestamp, this.timestamp);
                const [open, close] = id ?
                    NodeBuilder.getElementTags(this.name, Object.assign({ id }, assertedTimestamp)) :
                    NodeBuilder.getElementTags(this.name, assertedTimestamp);
                return [open, [...this.children, ...children].map(({ node, context }) => node.getXML(Object.assign({ linkName: this.linkName }, context))).flat(), close];
            } });
        if (id) {
            return Object.assign(Object.assign({}, obj2), { id });
        }
        return obj2;
    }
    link(id, timestamp, linkName) {
        if (!linkName) {
            throw new Error(`Cannot link, no linkName provided`);
        }
        return NodeBuilder.getElementTags(linkName, Object.assign({ producer: id }, timestamp), true);
    }
}
exports.NodeBuilder = NodeBuilder;
(function (NodeBuilder) {
    function getAttributeTags(attributes) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ");
    }
    NodeBuilder.getAttributeTags = getAttributeTags;
    function getElementTags(name, attributes, selfClosing = false) {
        if (selfClosing) {
            return [`<${name} ${getAttributeTags(attributes)}/>`];
        }
        else {
            return [`<${name}${getAttributeTags(attributes)}>`, `</${name}>`];
        }
    }
    NodeBuilder.getElementTags = getElementTags;
    function getProperty(name, value) {
        const [open, close] = getElementTags("property", { name });
        return open + value + close;
    }
    NodeBuilder.getProperty = getProperty;
    function assertTimestamp(timestamp, alternate = {}) {
        if ("in" in timestamp || "out" in timestamp) {
            return timestamp;
        }
        return alternate;
    }
    NodeBuilder.assertTimestamp = assertTimestamp;
})(NodeBuilder = exports.NodeBuilder || (exports.NodeBuilder = {}));
