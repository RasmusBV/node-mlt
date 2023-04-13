import { LinkableParentNode, ParentNode, Timestamp } from "../nodes.js";
import { Track, Producers } from "../mlt.js";
import { Transition } from "./transition.js";
import { Filter } from "./filter.js";
declare class Multitrack extends ParentNode<"multitrack"> {
    tracks: Producers[];
    constructor(tracks: Track[]);
    addTrack(producer: Producers, timestamp?: Timestamp): this;
}
export type LinkedFilter = {
    filter: Filter;
    track: Producers;
    timestamp?: Timestamp;
};
export type LinkedTransition = {
    transition: Transition;
    a_track: Producers;
    b_track: Producers;
    timestamp?: Timestamp;
};
export declare class Tractor extends LinkableParentNode<"tractor"> {
    multitrack: Multitrack;
    constructor(tracks: Track[], filters?: LinkedFilter[], transitions?: LinkedTransition[], timestamp?: Timestamp);
    addTrack(producer: Producers, timestamp?: Timestamp): this;
    addFilter(filter: Filter, track: Producers, timestamp?: Timestamp): this;
    addTransition(transition: Transition, a_track: Producers, b_track: Producers, timestamp?: Timestamp): this;
}
export {};
//# sourceMappingURL=tractor.d.ts.map