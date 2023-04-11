import { Track } from "../mlt.js";
import { Filter } from "./services/filter.js";
import { Consumer } from "./services/consumer.js";
export declare namespace Root {
    class Builder {
        private profile;
        private filters;
        private consumer;
        addGlobalFilter(filter: Filter): void;
        addProfile(profile: Record<string, string | number>): void;
        addConsumer(consumer: Consumer): void;
        createDocument(node: Track): string;
    }
}
//# sourceMappingURL=root.d.ts.map