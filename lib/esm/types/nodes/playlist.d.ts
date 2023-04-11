import { Timestamp, LinkableNode, Node, Track } from "../mlt.js";
type Blank = Node<"blank", {}>;
declare function Blank(length: number): Blank;
export interface Playlist extends LinkableNode<"playlist", Timestamp, Track | Blank> {
}
export declare namespace Playlist {
    class Builder {
        private builder;
        addEntry(entry: Track, timestamp?: Timestamp): this;
        addBlank(length: number): this;
        build(): Playlist;
    }
}
export {};
//# sourceMappingURL=playlist.d.ts.map