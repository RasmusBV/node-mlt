import { Service, Timestamp } from "../nodes"

export class Transition extends Service {
    constructor(mlt_service: Transition.Services, properties: Record<string, string | number>, timestamp?: Timestamp) {
        super("transition", mlt_service, properties, timestamp)
    }
}
export namespace Transition {
    export type Services = "affine" | "composite" | "frei0r.addition" | "frei0r.addition_alpha" | "frei0r.alphaatop" | "frei0r.alphain" | "frei0r.alphainjection" | "frei0r.alphaout" | "frei0r.alphaover" | "frei0r.alphaxor" | "frei0r.blend" | "frei0r.burn" | "frei0r.cairoaffineblend" | "frei0r.cairoblend" | "frei0r.color_only" | "frei0r.composition" | "frei0r.darken" | "frei0r.difference" | "frei0r.divide" | "frei0r.dodge" | "frei0r.grain_extract" | "frei0r.grain_merge" | "frei0r.hardlight" | "frei0r.hue" | "frei0r.lighten" | "frei0r.multiply" | "frei0r.overlay" | "frei0r.saturation" | "frei0r.screen" | "frei0r.softlight" | "frei0r.subtract" | "frei0r.uvmap" | "frei0r.value" | "frei0r.xfade0r" | "luma" | "matte" | "mix" | "movit.luma_mix" | "movit.mix" | "movit.overlay" | "qtblend" | "vqm"
}

