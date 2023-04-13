import { Timestamp, Node } from './nodes.js';
import { Producer } from './nodes/producer.js';
import { Playlist } from './nodes/playlist.js';
import { Tractor } from './nodes/tractor.js';
import { Consumer } from './nodes/consumer.js';
import { Filter } from './nodes/filter.js';
export type Producers = Producer | Playlist | Tractor;
export type Track = {
    element: Producers;
    context: {
        timestamp?: Timestamp;
    };
};
export type Entry = Track | {
    element: Node<"blank">;
};
export declare class Document {
    private profile;
    private consumer;
    private filters;
    private root;
    constructor({ profile, consumer, filters, root }?: {
        profile?: Record<string, string | number>;
        consumer?: Consumer;
        filters?: Filter[];
        root?: Producer;
    });
    addProfile(profile: Record<string, string | number>): void;
    addConsumer(consumer: Consumer): void;
    addFilter(filter: Filter): void;
    addRoot(root: Producer): void;
    generateDocument(): string;
    private static indenter;
    private static nodeCrawler;
}
//# sourceMappingURL=mlt.d.ts.map