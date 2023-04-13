import { Service, Timestamp } from "../nodes.js";
export declare class Consumer extends Service<"consumer"> {
    constructor(mlt_service: Consumer.Services, properties: Record<string, string | number>, timestamp?: Timestamp);
}
export declare namespace Consumer {
    type Services = "avformat" | "blipflash" | "cbrts" | "decklink" | "jack" | "multi" | "null" | "qglsl" | "rtaudio" | "sdl" | "sdl2" | "sdl2_audio" | "sdl_audio" | "sdl_preview" | "sdl_still" | "xml";
    function Video(path: string, timestamp?: Timestamp): Consumer;
}
//# sourceMappingURL=consumer.d.ts.map