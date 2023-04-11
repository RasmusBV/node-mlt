import { Timestamp, Property, ParentNode } from "../../mlt.js";
export type Consumer = ParentNode<"consumer", Timestamp, Property>;
export declare namespace Consumer {
    type Services = "avformat" | "blipflash" | "cbrts" | "decklink" | "jack" | "multi" | "null" | "qglsl" | "rtaudio" | "sdl" | "sdl2" | "sdl2_audio" | "sdl_audio" | "sdl_preview" | "sdl_still" | "xml";
    class Builder {
        private builder;
        constructor(mlt_service: Services);
        addTimestamp(timestamp: Timestamp): this;
        addProperty(name: string, value: string | number): this;
        build(): Consumer;
    }
    function Video(path: string, timestamp?: Timestamp): Consumer;
}
//# sourceMappingURL=consumer.d.ts.map