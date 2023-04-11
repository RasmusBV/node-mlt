import { NodeBuilder } from "../mlt.js";
export var Tractor;
(function (Tractor) {
    class Builder {
        multitrackBuilder = new NodeBuilder("multitrack", "track");
        builder = new NodeBuilder("tractor");
        addEntry(entry, timestamp = {}) {
            //Truly an insane type assertion i have to make here but whatever im probably just dumb 😤
            this.multitrackBuilder.addChild({ node: entry, context: timestamp });
            return this;
        }
        addFilter(filter, track, timestamp = {}) {
            const index = this.multitrackBuilder.indexOf(track);
            this.builder.addChild({ node: filter, context: { track: index, ...timestamp } });
            return this;
        }
        addTransition(transition, a_track, b_track, timestamp = {}) {
            const a_index = this.multitrackBuilder.indexOf(a_track);
            const b_index = this.multitrackBuilder.indexOf(b_track);
            this.builder.addChild({ node: transition, context: { a_track: a_index, b_track: b_index, ...timestamp } });
            return this;
        }
        build() {
            const multitrack = this.multitrackBuilder.build(() => { return {}; });
            this.builder.addChild({ node: multitrack, context: {} });
            this.builder.children.reverse();
            return this.builder.build(({ linkName = undefined, ...timestamp }) => { return { timestamp }; }, true);
        }
    }
    Tractor.Builder = Builder;
})(Tractor || (Tractor = {}));
