import { LinkableParentNode, Node, Timestamp } from "../nodes"
import { Entry, Producers } from "../document"

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
