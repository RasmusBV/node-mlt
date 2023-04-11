import { randomBytes } from 'crypto';
export function Property(name, value) {
    return {
        name: "property",
        getXML: () => {
            return [NodeBuilder.getProperty(name, value)];
        }
    };
}
export class NodeBuilder {
    name;
    children = [];
    timestamp = {};
    linkName;
    constructor(name, linkName) {
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
        const id = linkable ? this.name + "_" + randomBytes(4).toString('hex') : undefined;
        let linked = false;
        const obj2 = {
            ...obj,
            getXML: (context) => {
                const { children = [], timestamp = {} } = callback(context);
                if (linked && id) {
                    const { linkName = undefined } = context;
                    return this.link(id, NodeBuilder.assertTimestamp(timestamp), linkName);
                }
                linked = true;
                const assertedTimestamp = NodeBuilder.assertTimestamp(timestamp, this.timestamp);
                const [open, close] = id ?
                    NodeBuilder.getElementTags(this.name, { id, ...assertedTimestamp }) :
                    NodeBuilder.getElementTags(this.name, assertedTimestamp);
                return [open, [...this.children, ...children].map(({ node, context }) => node.getXML({ linkName: this.linkName, ...context })).flat(), close];
            }
        };
        if (id) {
            return {
                ...obj2,
                id
            };
        }
        return obj2;
    }
    link(id, timestamp, linkName) {
        if (!linkName) {
            throw new Error(`Cannot link, no linkName provided`);
        }
        return NodeBuilder.getElementTags(linkName, { producer: id, ...timestamp }, true);
    }
}
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
})(NodeBuilder || (NodeBuilder = {}));
