import { LinkableParentNode, Node, Timestamp } from "../nodes"
import { Track, Producers } from "../document"

export class Playlist {
    node: LinkableParentNode
    constructor(entries: Playlist.Entry[]) {
        this.node = new LinkableParentNode("playlist", entries, {}, "entry")
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.node.children.push({element: producer, context: {timestamp}})
        return this
    }
}

export namespace Playlist {
    export type Entry = Track | {element: Blank}
    export class Blank {
        node: Node
        constructor(length: number) {
            this.node = new Node("blank", {length})
        }
    }
}