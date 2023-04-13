import { LinkableParentNode, Node, Timestamp } from "../nodes.js"
import { Entry, Producers } from "../mlt.js"

export class Playlist extends LinkableParentNode<"playlist"> {
    constructor(entries: Entry[]) {
        super("playlist", entries, {}, "entry")
    }
    static Blank(length: number) {
        return new Node("blank", {length})
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.children.push({element: producer, context: {timestamp}})
        return this
    }
}
