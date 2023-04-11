import { Timestamp, NodeBuilder, LinkableNode, ParentNode, Node, Track } from "../mlt.js";
import { Transition } from "./services/transition.js";
import { Filter } from "./services/filter.js";


interface Multitrack extends ParentNode<"multitrack", Timestamp, Track> {}

export interface Tractor extends LinkableNode<"tractor", Timestamp, Multitrack | Filter | Transition> {}

export namespace Tractor {
    export class Builder {
        private multitrackBuilder = new NodeBuilder<"multitrack", {}, Track>("multitrack", "track")
        private builder = new NodeBuilder<"tractor", Timestamp, Multitrack | Filter | Transition>("tractor")
        addEntry(entry: Track, timestamp: Timestamp = {}) {
            //Truly an insane type assertion i have to make here but whatever im probably just dumb 😤
            this.multitrackBuilder.addChild({node: entry as Node<"producer", Timestamp>, context: timestamp})
            return this
        }
        addFilter(filter: Filter, track: Track, timestamp: Timestamp = {}) {
            const index = this.multitrackBuilder.indexOf(track)
            this.builder.addChild({node: filter, context: {track: index, ...timestamp}})
            return this
        }
        addTransition(transition: Transition, a_track: Track, b_track: Track, timestamp: Timestamp = {}) {
            const a_index = this.multitrackBuilder.indexOf(a_track)
            const b_index = this.multitrackBuilder.indexOf(b_track)
            this.builder.addChild({node: transition, context: {a_track: a_index, b_track: b_index, ...timestamp}})
            return this
        }
        build(): Tractor {
            const multitrack = this.multitrackBuilder.build(() => {return {}})
            this.builder.addChild({node: multitrack, context: {}})
            this.builder.children.reverse()
            return this.builder.build(({linkName = undefined, ...timestamp}) => {return {timestamp}}, true)
        }
    }
}