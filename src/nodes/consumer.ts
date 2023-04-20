import { Service, Timestamp } from "../nodes"

export class Consumer extends Service {
    constructor(mlt_service: Consumer.Services, properties: Record<string, string | number>, timestamp?: Timestamp) {
        super("consumer", mlt_service, properties, timestamp)
    }
}
export namespace Consumer {
    export type Services = "avformat" | "blipflash" | "cbrts" | "decklink" | "jack" | "multi" | "null" | "qglsl" | "rtaudio" | "sdl" | "sdl2" | "sdl2_audio" | "sdl_audio" | "sdl_preview" | "sdl_still" | "xml"
    export function Video(path: string, timestamp?: Timestamp) {
        return new Consumer("avformat", {resource: path}, timestamp)
    }
}
