import { LinkableParentNode, Node } from "../nodes.js";
export class Producer extends LinkableParentNode {
    constructor(mlt_service, properties, timestamp) {
        const children = Node.mapPropertiesToNodes(properties);
        children.push({ element: Node.Property("mlt_service", mlt_service) });
        super("producer", children, timestamp);
    }
    addProperty(name, value) {
        this.children.push({ element: Node.Property(name, value) });
        return this;
    }
}
(function (Producer) {
    function Image(path, timestamp) {
        return new Producer("pixbuf", { resource: path }, timestamp);
    }
    Producer.Image = Image;
    function Video(path, timestamp) {
        return new Producer("avformat", { resource: path }, timestamp);
    }
    Producer.Video = Video;
})(Producer || (Producer = {}));
