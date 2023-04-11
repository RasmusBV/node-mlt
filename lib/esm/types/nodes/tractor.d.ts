import { Timestamp, LinkableNode, ParentNode, Track } from "../mlt.js";
import { Transition } from "./services/transition.js";
import { Filter } from "./services/filter.js";
interface Multitrack extends ParentNode<"multitrack", Timestamp, Track> {
}
export interface Tractor extends LinkableNode<"tractor", Timestamp, Multitrack | Filter | Transition> {
}
export declare namespace Tractor {
    class Builder {
        private multitrackBuilder;
        private builder;
        addEntry(entry: Track, timestamp?: Timestamp): this;
        addFilter(filter: Filter, track: Track): this;
        addTransition(transition: Transition, a_track: Track, b_track: Track): this;
        build(): Tractor;
    }
}
export {};
//# sourceMappingURL=tractor.d.ts.map