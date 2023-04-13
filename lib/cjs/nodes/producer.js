"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Producer = void 0;
const nodes_js_1 = require("../nodes.js");
class Producer extends nodes_js_1.LinkableParentNode {
    constructor(mlt_service, properties, timestamp) {
        const children = nodes_js_1.Node.mapPropertiesToNodes(properties);
        children.push({ element: nodes_js_1.Node.Property("mlt_service", mlt_service) });
        super("producer", children, timestamp);
    }
    addProperty(name, value) {
        this.children.push({ element: nodes_js_1.Node.Property(name, value) });
        return this;
    }
}
exports.Producer = Producer;
(function (Producer) {
    function Image(path, timestamp) {
        return new Producer("pixbuf", { resource: path }, timestamp);
    }
    Producer.Image = Image;
    function Video(path, timestamp) {
        return new Producer("avformat", { resource: path }, timestamp);
    }
    Producer.Video = Video;
})(Producer = exports.Producer || (exports.Producer = {}));
