import { LinkableParentNode, Node } from "../nodes.js";
export class Playlist extends LinkableParentNode {
    constructor(entries) {
        super("playlist", entries, {}, "entry");
    }
    static Blank(length) {
        return new Node("blank", { length });
    }
    addTrack(producer, timestamp = {}) {
        this.children.push({ element: producer, context: { timestamp } });
        return this;
    }
}
