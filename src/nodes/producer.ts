import { LinkableParentNode, Node, Timestamp, Property } from "../nodes"

export class Producer {
    node: LinkableParentNode
    constructor(mlt_service: Producer.Services, properties: Record<string, string | number> = {}, timestamp?: Timestamp) {
        const children = Node.mapPropertiesToNodes(properties)
        children.push({element: new Property("mlt_service", mlt_service)})
        this.node = new LinkableParentNode("producer", children, timestamp)
    }
    pushProperty(name: string, value: string | number) {
        this.node.addChild(new Property(name, value))
        return this
    }
}

export namespace Producer {
    export type Services = "abnormal" | "avformat" | "avformat-novalidate" | "blipflash" | "color" | "colour" | "consumer" | "count" | "decklink" | "framebuffer" | "frei0r.ising0r" | "frei0r.lissajous0r" | "frei0r.nois0r" | "frei0r.onecol0r" | "frei0r.partik0l" | "frei0r.plasma" | "frei0r.test_pat_B" | "frei0r.test_pat_C" | "frei0r.test_pat_G" | "frei0r.test_pat_I" | "frei0r.test_pat_L" | "frei0r.test_pat_R" | "glaxnimate" | "hold" | "kdenlivetitle" | "ladspa.1047" | "ladspa.1050" | "ladspa.1066" | "ladspa.1069" | "ladspa.1086" | "ladspa.1221" | "ladspa.1222" | "ladspa.1223" | "ladspa.1226" | "ladspa.1416" | "ladspa.1642" | "ladspa.1644" | "ladspa.1648" | "ladspa.1652" | "ladspa.1660" | "ladspa.1664" | "ladspa.1769" | "ladspa.1770" | "ladspa.1774" | "ladspa.1781" | "ladspa.1785" | "ladspa.1841" | "ladspa.1843" | "ladspa.1844" | "ladspa.1849" | "ladspa.1881" | "ladspa.1885" | "ladspa.2038" | "loader" | "loader-nogl" | "melt" | "melt_file" | "noise" | "pango" | "pgm" | "pixbuf" | "qimage" | "qtext" | "timewarp" | "tone" | "vorbis" | "xml" | "xml-nogl" | "xml-string"
    export function Image(path: string, timestamp?: Timestamp) {
        return new Producer("pixbuf", {resource: path}, timestamp)
    }
    export function Video(path: string, timestamp?: Timestamp) {
        return new Producer("avformat", {resource: path}, timestamp)
    }
}