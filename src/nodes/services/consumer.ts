import { Timestamp, NodeBuilder, Property, ParentNode } from "../../mlt.js";

export type Consumer = ParentNode<"consumer", Timestamp, Property>

export namespace Consumer {
    export type Services = "avformat" | "blipflash" | "cbrts" | "decklink" | "jack" | "multi" | "null" | "qglsl" | "rtaudio" | "sdl" | "sdl2" | "sdl2_audio" | "sdl_audio" | "sdl_preview" | "sdl_still" | "xml"
    export class Builder {
        private builder = new NodeBuilder<"consumer", Timestamp, Property>("consumer")
        constructor(mlt_service: Services) {
            this.builder.addChild({node: Property("mlt_service", mlt_service), context: {}})
        }
        addTimestamp(timestamp: Timestamp) {
            this.builder.addTimestamp(timestamp)
            return this
        }
        addProperty(name: string, value: string | number) {
            this.builder.addChild({node: Property(name, value), context: {}})
            return this
        }
        build(): Consumer {
            return this.builder.build(({linkName = undefined, ...timestamp}) => {return {timestamp}})
        }
    }
    export function Video(path: string, timestamp: Timestamp = {}) {
        return new Builder("avformat")
            .addTimestamp(timestamp)
            .addProperty("resource", path)
            .build()
    }
}