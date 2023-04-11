import { Timestamp, NodeBuilder, LinkableNode, Node, Track } from "../mlt.js";

type Blank = Node<"blank", {}>

function Blank(length: number): Blank {
    return {
        name: "blank",
        getXML: () => NodeBuilder.getElementTags("blank", {length}, true)
    }
}

export interface Playlist extends LinkableNode<"playlist", Timestamp, Track | Blank> {}

export namespace Playlist {
    export class Builder {
        private builder = new NodeBuilder<"playlist", Timestamp, Track | Blank>("playlist", "entry")
        addEntry(entry: Track, timestamp: Timestamp = {}) {
            //Truly an insane type assertion i have to make here but whatever im probably just dumb 😤
            this.builder.addChild({node: entry as Node<"producer", Timestamp>, context: timestamp})
            return this
        }
        addBlank(length: number) {
            this.builder.addChild({node: Blank(length), context: {}})
            return this
        }
        build(): Playlist {
            return this.builder.build(({linkName = undefined, ...timestamp}) => {return {timestamp}}, true)
        }
    }
}