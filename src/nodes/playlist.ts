import { LinkableParentNode, Node, Timestamp } from "../nodes"
import { Producers } from "../document"

export class Playlist {
    node: LinkableParentNode
    constructor(entries: Playlist.Entry[]) {
        this.node = new LinkableParentNode("playlist", entries, {}, "entry")
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.node.addChild(producer, timestamp)
        return this
    }
    addBlank(length: number) {
        this.node.addChild(new Playlist.Blank(length))
    }
}

export namespace Playlist {
    export type Entry = {element: Producers, timestamp?: Timestamp} | {element: Blank}
    export class Blank {
        node: Node
        constructor(length: number) {
            this.node = new Node("blank", {length})
        }
    }
}