import { LinkableParentNode, Node, Timestamp } from "../nodes.js";
import { Entry, Producers } from "../mlt.js";
export declare class Playlist extends LinkableParentNode<"playlist"> {
    constructor(entries: Entry[]);
    static Blank(length: number): Node<"blank">;
    addTrack(producer: Producers, timestamp?: Timestamp): this;
}
//# sourceMappingURL=playlist.d.ts.map