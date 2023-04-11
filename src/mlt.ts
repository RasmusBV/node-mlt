import { randomBytes } from 'crypto'

type XMLString = (string | XMLString)[]
type Timestamp = {in?: number, out?: number}
type Context = {timestamp?: Timestamp, children?: ChildElement[]}
type ChildElement = ({element: ParentNode<any> | LinkableParentNode<any>, context: Context}|{element: Node<any>})

class Node<R extends string> {
    name: R
    attributes: Record<string, string | number>
    value: string | number | undefined
    constructor(name: R, attributes: Record<string, string | number>, value?: string | number) {
        this.name = name
        this.attributes = attributes
        this.value = value
    }
    getXML(): XMLString {
        if(this.value !== undefined) {
            return [`<${this.name}${Node.getAttributeTags(this.attributes)}>${this.value}</${this.name}>`]
        } else {
            return [`<${this.name}${Node.getAttributeTags(this.attributes)}/>`]
        }
    }
    private static getAttributeTags(attributes: Record<string, string | number>) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
    }
    static Property(name: string, value: string | number) {
        return new Node("property", {name}, value)
    }
    static mapPropertiesToNodes(properties: Record<string, string | number>) {
        console.log()
        const nodes: ChildElement[] = Array(Object.entries(properties).length).fill(null)
        let i = 0
        for(const property in properties) {
            nodes[i] = {element: Node.Property(property, properties[property])}
        }
        return nodes
    }
}

class ParentNode<R extends string> {
    name: R
    timestamp: Timestamp
    children: ChildElement[]
    linkName: string | undefined
    id: Record<string, string> = {}
    constructor(name: R, children: ChildElement[], timestamp: Timestamp = {}, linkName?: string) {
        this.name = name
        this.timestamp = timestamp
        this.children = children
        this.linkName = linkName
        this.id = {id: name + "_" + randomBytes(4).toString('hex')}
    }
    getXML({timestamp = undefined, children=[]}: Context): XMLString {
        const availableTimestamp: Record<string, string | number> = timestamp ? timestamp : this.timestamp
        const open = `<${this.name}${ParentNode.getAttributeTags({...availableTimestamp, ...this.id})}>`
        const close = `</${this.name}>`
        const childXML: XMLString[] = Array(children.length + this.children.length).fill(null)
        for(let i = 0; i < children.length; i++) {
            const child = children[i]
            childXML[i] = ParentNode.getChildXML(child, this.linkName)
        }
        for(let i = 0; i < this.children.length; i++) {
            const child = this.children[i]
            childXML[i+children.length] = ParentNode.getChildXML(child, this.linkName)
        }
        return [open, childXML.flat(), close]
    }
    static getAttributeTags(attributes: Record<string, string | number>) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
    }
    static getChildXML(child: ChildElement, linkName: string | undefined) {
        if("context" in child) {
            return child.element.getXML(child.context, linkName)
        } else {
            return child.element.getXML()
        }
    }
}

class LinkableParentNode<R extends string> extends ParentNode<R> {
    linked = false
    constructor(name: R, children: ChildElement[], timestamp: Timestamp = {}, linkName?: string) {
        super(name, children, timestamp, linkName)
    }
    getXML({timestamp = undefined, children=[]}: Context, linkName?: string): XMLString {
        if(!this.linked) {
            this.linked = true
            return super.getXML({timestamp, children})
        }
        if(!linkName) {
            throw new Error("Cannot link, no linkName provided") //This is so sad
        }
        const trueTimestamp = timestamp || {}
        return [`<${linkName} ${ParentNode.getAttributeTags({producer: this.id.id, ...trueTimestamp})}/>`]
    }
}

type Producers = Producer | Playlist | Tractor
type Track = {element: Producers, context: {timestamp?: Timestamp}}
type Entry = Track|{element: Node<"blank">}

class Service<R extends string> extends ParentNode<R>{
    constructor(name: R, mlt_service: string, properties: Record<string, string | number>, timestamp?: Timestamp) {
        const children = Node.mapPropertiesToNodes(properties)
        children.push({element: Node.Property("mlt_service", mlt_service)})
        super(name, children, timestamp)
    }
    addProperty(name: string, value: string | number) {
        this.children.push({element: Node.Property(name, value)})
    }
}

export class Producer extends LinkableParentNode<"producer"> {
    constructor(mlt_service: Producer.Services, properties: Record<string, string | number>, timestamp?: Timestamp) {
        const children = Node.mapPropertiesToNodes(properties)
        children.push({element: Node.Property("mlt_service", mlt_service)})
        super("producer", children, timestamp)
    }
    addProperty(name: string, value: string | number) {
        this.children.push({element: Node.Property(name, value)})
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

export class Consumer extends Service<"consumer"> {
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


export class Filter extends Service<"filter"> {
    constructor(mlt_service: Filter.Services, properties: Record<string, string | number>, timestamp?: Timestamp) {
        super("filter", mlt_service, properties, timestamp)
    }
}
export namespace Filter {
    export type Services = "BurningTV" | "affine" | "audiochannels" | "audioconvert" | "audiolevel" | "audiolevelgraph" | "audiomap" | "audiospectrum" | "audiowave" | "audiowaveform" | "avcolor_space" | "avcolour_space" | "avdeinterlace" | "avfilter.abench" | "avfilter.acompressor" | "avfilter.acontrast" | "avfilter.acrusher" | "avfilter.acue" | "avfilter.addroi" | "avfilter.adeclick" | "avfilter.adeclip" | "avfilter.adecorrelate" | "avfilter.adelay" | "avfilter.adenorm" | "avfilter.aderivative" | "avfilter.adrc" | "avfilter.adynamicequalizer" | "avfilter.adynamicsmooth" | "avfilter.aecho" | "avfilter.aemphasis" | "avfilter.aeval" | "avfilter.aexciter" | "avfilter.afade" | "avfilter.afftdn" | "avfilter.afftfilt" | "avfilter.afreqshift" | "avfilter.afwtdn" | "avfilter.agate" | "avfilter.aintegral" | "avfilter.alatency" | "avfilter.alimiter" | "avfilter.allpass" | "avfilter.aloop" | "avfilter.alphaextract" | "avfilter.alphamerge" | "avfilter.ametadata" | "avfilter.amplify" | "avfilter.anlmdn" | "avfilter.anlmf" | "avfilter.anlms" | "avfilter.aphaser" | "avfilter.aphaseshift" | "avfilter.apsyclip" | "avfilter.apulsator" | "avfilter.arealtime" | "avfilter.arnndn" | "avfilter.asdr" | "avfilter.ashowinfo" | "avfilter.asidedata" | "avfilter.asoftclip" | "avfilter.aspectralstats" | "avfilter.ass" | "avfilter.astats" | "avfilter.asubboost" | "avfilter.asubcut" | "avfilter.asupercut" | "avfilter.asuperpass" | "avfilter.asuperstop" | "avfilter.atadenoise" | "avfilter.atilt" | "avfilter.avgblur" | "avfilter.axcorrelate" | "avfilter.backgroundkey" | "avfilter.bandpass" | "avfilter.bandreject" | "avfilter.bass" | "avfilter.bbox" | "avfilter.bench" | "avfilter.bilateral" | "avfilter.biquad" | "avfilter.bitplanenoise" | "avfilter.blackdetect" | "avfilter.blackframe" | "avfilter.blend" | "avfilter.blockdetect" | "avfilter.blurdetect" | "avfilter.boxblur" | "avfilter.bwdif" | "avfilter.cas" | "avfilter.channelmap" | "avfilter.chorus" | "avfilter.chromahold" | "avfilter.chromakey" | "avfilter.chromanr" | "avfilter.chromashift" | "avfilter.ciescope" | "avfilter.colorbalance" | "avfilter.colorchannelmixer" | "avfilter.colorcontrast" | "avfilter.colorcorrect" | "avfilter.colorhold" | "avfilter.colorize" | "avfilter.colorkey" | "avfilter.colorlevels" | "avfilter.colormap" | "avfilter.colormatrix" | "avfilter.colorspace" | "avfilter.colortemperature" | "avfilter.compand" | "avfilter.compensationdelay" | "avfilter.convolution" | "avfilter.convolve" | "avfilter.corr" | "avfilter.crop" | "avfilter.cropdetect" | "avfilter.crossfeed" | "avfilter.crystalizer" | "avfilter.cue" | "avfilter.curves" | "avfilter.datascope" | "avfilter.dblur" | "avfilter.dcshift" | "avfilter.dctdnoiz" | "avfilter.deband" | "avfilter.deblock" | "avfilter.deconvolve" | "avfilter.dedot" | "avfilter.deesser" | "avfilter.deflate" | "avfilter.deflicker" | "avfilter.deinterlace_vaapi" | "avfilter.delogo" | "avfilter.denoise_vaapi" | "avfilter.derain" | "avfilter.deshake" | "avfilter.despill" | "avfilter.dialoguenhance" | "avfilter.dilation" | "avfilter.dnn_classify" | "avfilter.dnn_detect" | "avfilter.dnn_processing" | "avfilter.doubleweave" | "avfilter.drawbox" | "avfilter.drawgraph" | "avfilter.drawgrid" | "avfilter.drmeter" | "avfilter.dynaudnorm" | "avfilter.earwax" | "avfilter.edgedetect" | "avfilter.elbg" | "avfilter.entropy" | "avfilter.epx" | "avfilter.eq" | "avfilter.equalizer" | "avfilter.erosion" | "avfilter.estdif" | "avfilter.exposure" | "avfilter.extrastereo" | "avfilter.fade" | "avfilter.fftdnoiz" | "avfilter.fftfilt" | "avfilter.field" | "avfilter.fieldhint" | "avfilter.fieldorder" | "avfilter.fillborders" | "avfilter.find_rect" | "avfilter.firequalizer" | "avfilter.flanger" | "avfilter.floodfill" | "avfilter.framepack" | "avfilter.freezedetect" | "avfilter.freezeframes" | "avfilter.fspp" | "avfilter.gblur" | "avfilter.geq" | "avfilter.gradfun" | "avfilter.graphmonitor" | "avfilter.grayworld" | "avfilter.greyedge" | "avfilter.haas" | "avfilter.haldclut" | "avfilter.hdcd" | "avfilter.hflip" | "avfilter.highpass" | "avfilter.highshelf" | "avfilter.histeq" | "avfilter.histogram" | "avfilter.hqdn3d" | "avfilter.hqx" | "avfilter.hsvhold" | "avfilter.hsvkey" | "avfilter.hue" | "avfilter.huesaturation" | "avfilter.hwdownload" | "avfilter.hwmap" | "avfilter.hwupload" | "avfilter.identity" | "avfilter.idet" | "avfilter.il" | "avfilter.inflate" | "avfilter.kerndeint" | "avfilter.kirsch" | "avfilter.lagfun" | "avfilter.latency" | "avfilter.lenscorrection" | "avfilter.libvmaf" | "avfilter.limiter" | "avfilter.loop" | "avfilter.loudnorm" | "avfilter.lowpass" | "avfilter.lowshelf" | "avfilter.lumakey" | "avfilter.lut" | "avfilter.lut1d" | "avfilter.lut2" | "avfilter.lut3d" | "avfilter.lutrgb" | "avfilter.lutyuv" | "avfilter.maskedmax" | "avfilter.maskedmin" | "avfilter.maskedthreshold" | "avfilter.maskfun" | "avfilter.mcompand" | "avfilter.median" | "avfilter.metadata" | "avfilter.monochrome" | "avfilter.morpho" | "avfilter.msad" | "avfilter.multiply" | "avfilter.negate" | "avfilter.nlmeans" | "avfilter.nnedi" | "avfilter.noise" | "avfilter.normalize" | "avfilter.oscilloscope" | "avfilter.overlay_vaapi" | "avfilter.owdenoise" | "avfilter.pad" | "avfilter.perspective" | "avfilter.phase" | "avfilter.photosensitivity" | "avfilter.pixelize" | "avfilter.pixscope" | "avfilter.pp" | "avfilter.pp7" | "avfilter.prewitt" | "avfilter.procamp_vaapi" | "avfilter.pseudocolor" | "avfilter.random" | "avfilter.realtime" | "avfilter.removegrain" | "avfilter.removelogo" | "avfilter.rgbashift" | "avfilter.roberts" | "avfilter.rotate" | "avfilter.sab" | "avfilter.scale_vaapi" | "avfilter.scdet" | "avfilter.scharr" | "avfilter.scroll" | "avfilter.selectivecolor" | "avfilter.setrange" | "avfilter.sharpness_vaapi" | "avfilter.shear" | "avfilter.showinfo" | "avfilter.shuffleframes" | "avfilter.shufflepixels" | "avfilter.shuffleplanes" | "avfilter.sidedata" | "avfilter.signalstats" | "avfilter.silencedetect" | "avfilter.siti" | "avfilter.smartblur" | "avfilter.sobel" | "avfilter.speechnorm" | "avfilter.spp" | "avfilter.sr" | "avfilter.ssim360" | "avfilter.stereo3d" | "avfilter.stereotools" | "avfilter.stereowiden" | "avfilter.subtitles" | "avfilter.super2xsai" | "avfilter.superequalizer" | "avfilter.swaprect" | "avfilter.swapuv" | "avfilter.tblend" | "avfilter.thistogram" | "avfilter.threshold" | "avfilter.tiltshelf" | "avfilter.tlut2" | "avfilter.tmedian" | "avfilter.tmidequalizer" | "avfilter.tmix" | "avfilter.tonemap" | "avfilter.tonemap_vaapi" | "avfilter.tpad" | "avfilter.transpose" | "avfilter.transpose_vaapi" | "avfilter.treble" | "avfilter.tremolo" | "avfilter.unsharp" | "avfilter.untile" | "avfilter.v360" | "avfilter.vaguedenoiser" | "avfilter.varblur" | "avfilter.vectorscope" | "avfilter.vflip" | "avfilter.vibrance" | "avfilter.vibrato" | "avfilter.vif" | "avfilter.vignette" | "avfilter.virtualbass" | "avfilter.vmafmotion" | "avfilter.volume" | "avfilter.volumedetect" | "avfilter.w3fdif" | "avfilter.waveform" | "avfilter.weave" | "avfilter.xbr" | "avfilter.xcorrelate" | "avfilter.xfade" | "avfilter.yadif" | "avfilter.yaepblur" | "avfilter.zoompan" | "avfilter.zscale" | "box_blur" | "boxblur" | "brightness" | "burningtv" | "cairoblend_mode" | "channelcopy" | "channelswap" | "charcoal" | "choppy" | "chroma" | "chroma_hold" | "crop" | "dance" | "deinterlace" | "deshake" | "dust" | "dynamic_loudness" | "dynamictext" | "fft" | "fieldorder" | "freeze" | "frei0r.3dflippo" | "frei0r.B" | "frei0r.G" | "frei0r.IIRblur" | "frei0r.R" | "frei0r.aech0r" | "frei0r.alpha0ps" | "frei0r.alphagrad" | "frei0r.alphaspot" | "frei0r.balanc0r" | "frei0r.baltan" | "frei0r.bgsubtract0r" | "frei0r.bigsh0t_eq_cap" | "frei0r.bigsh0t_eq_mask" | "frei0r.bigsh0t_eq_to_rect" | "frei0r.bigsh0t_eq_to_stereo" | "frei0r.bigsh0t_eq_wrap" | "frei0r.bigsh0t_hemi_to_eq" | "frei0r.bigsh0t_rect_to_eq" | "frei0r.bigsh0t_stabilize_360" | "frei0r.bigsh0t_transform_360" | "frei0r.bigsh0t_zenith_correction" | "frei0r.bluescreen0r" | "frei0r.brightness" | "frei0r.bw0r" | "frei0r.c0rners" | "frei0r.cairogradient" | "frei0r.cairoimagegrid" | "frei0r.cartoon" | "frei0r.cluster" | "frei0r.colgate" | "frei0r.coloradj_RGB" | "frei0r.colordistance" | "frei0r.colorhalftone" | "frei0r.colorize" | "frei0r.colortap" | "frei0r.contrast0r" | "frei0r.curves" | "frei0r.d90stairsteppingfix" | "frei0r.defish0r" | "frei0r.delay0r" | "frei0r.delaygrab" | "frei0r.distort0r" | "frei0r.dither" | "frei0r.edgeglow" | "frei0r.elastic_scale" | "frei0r.emboss" | "frei0r.equaliz0r" | "frei0r.facebl0r" | "frei0r.facedetect" | "frei0r.flippo" | "frei0r.gamma" | "frei0r.glitch0r" | "frei0r.glow" | "frei0r.hqdn3d" | "frei0r.hueshift0r" | "frei0r.invert0r" | "frei0r.keyspillm0pup" | "frei0r.lenscorrection" | "frei0r.letterb0xed" | "frei0r.levels" | "frei0r.lightgraffiti" | "frei0r.luminance" | "frei0r.mask0mate" | "frei0r.medians" | "frei0r.ndvi" | "frei0r.nervous" | "frei0r.normaliz0r" | "frei0r.nosync0r" | "frei0r.pixeliz0r" | "frei0r.posterize" | "frei0r.pr0be" | "frei0r.pr0file" | "frei0r.premultiply" | "frei0r.primaries" | "frei0r.rgbnoise" | "frei0r.rgbparade" | "frei0r.rgbsplit0r" | "frei0r.saturat0r" | "frei0r.scale0tilt" | "frei0r.scanline0r" | "frei0r.select0r" | "frei0r.sharpness" | "frei0r.sigmoidaltransfer" | "frei0r.sobel" | "frei0r.softglow" | "frei0r.sopsat" | "frei0r.spillsupress" | "frei0r.squareblur" | "frei0r.tehRoxx0r" | "frei0r.three_point_balance" | "frei0r.threelay0r" | "frei0r.threshold0r" | "frei0r.timeout" | "frei0r.tint0r" | "frei0r.transparency" | "frei0r.twolay0r" | "frei0r.vectorscope" | "frei0r.vertigo" | "frei0r.vignette" | "gamma" | "glsl.manager" | "gpsgraphic" | "gpstext" | "grain" | "grayscale" | "greyscale" | "gtkrescale" | "imageconvert" | "invert" | "jack" | "jackrack" | "ladspa" | "ladspa.1041" | "ladspa.1042" | "ladspa.1043" | "ladspa.1044" | "ladspa.1045" | "ladspa.1046" | "ladspa.1048" | "ladspa.1049" | "ladspa.1051" | "ladspa.1052" | "ladspa.1053" | "ladspa.1054" | "ladspa.1055" | "ladspa.1056" | "ladspa.1057" | "ladspa.1058" | "ladspa.1059" | "ladspa.1060" | "ladspa.1061" | "ladspa.1062" | "ladspa.1063" | "ladspa.1064" | "ladspa.1065" | "ladspa.1067" | "ladspa.1068" | "ladspa.1070" | "ladspa.1071" | "ladspa.1072" | "ladspa.1073" | "ladspa.1074" | "ladspa.1075" | "ladspa.1076" | "ladspa.1077" | "ladspa.1087" | "ladspa.1088" | "ladspa.1089" | "ladspa.1090" | "ladspa.1091" | "ladspa.1092" | "ladspa.1093" | "ladspa.1094" | "ladspa.1095" | "ladspa.1096" | "ladspa.1097" | "ladspa.1098" | "ladspa.1123" | "ladspa.1181" | "ladspa.1185" | "ladspa.1186" | "ladspa.1187" | "ladspa.1188" | "ladspa.1189" | "ladspa.1190" | "ladspa.1191" | "ladspa.1192" | "ladspa.1193" | "ladspa.1194" | "ladspa.1195" | "ladspa.1196" | "ladspa.1197" | "ladspa.1198" | "ladspa.1199" | "ladspa.1200" | "ladspa.1201" | "ladspa.1202" | "ladspa.1203" | "ladspa.1204" | "ladspa.1206" | "ladspa.1207" | "ladspa.1208" | "ladspa.1209" | "ladspa.1210" | "ladspa.1211" | "ladspa.1212" | "ladspa.1213" | "ladspa.1214" | "ladspa.1215" | "ladspa.1216" | "ladspa.1217" | "ladspa.1218" | "ladspa.1219" | "ladspa.1220" | "ladspa.1224" | "ladspa.1225" | "ladspa.1227" | "ladspa.1337" | "ladspa.1401" | "ladspa.1402" | "ladspa.1403" | "ladspa.1404" | "ladspa.1405" | "ladspa.1406" | "ladspa.1407" | "ladspa.1408" | "ladspa.1409" | "ladspa.1410" | "ladspa.1411" | "ladspa.1412" | "ladspa.1413" | "ladspa.1414" | "ladspa.1415" | "ladspa.1417" | "ladspa.1418" | "ladspa.1419" | "ladspa.1420" | "ladspa.1421" | "ladspa.1422" | "ladspa.1423" | "ladspa.1424" | "ladspa.1425" | "ladspa.1426" | "ladspa.1427" | "ladspa.1428" | "ladspa.1429" | "ladspa.1430" | "ladspa.1431" | "ladspa.1432" | "ladspa.1433" | "ladspa.1436" | "ladspa.1437" | "ladspa.1438" | "ladspa.1439" | "ladspa.1440" | "ladspa.1605" | "ladspa.1641" | "ladspa.1643" | "ladspa.1645" | "ladspa.1646" | "ladspa.1647" | "ladspa.1649" | "ladspa.1650" | "ladspa.1651" | "ladspa.1653" | "ladspa.1654" | "ladspa.1655" | "ladspa.1656" | "ladspa.1657" | "ladspa.1658" | "ladspa.1661" | "ladspa.1662" | "ladspa.1663" | "ladspa.1665" | "ladspa.1666" | "ladspa.1668" | "ladspa.1669" | "ladspa.1671" | "ladspa.1672" | "ladspa.1673" | "ladspa.1675" | "ladspa.1676" | "ladspa.1677" | "ladspa.1678" | "ladspa.1679" | "ladspa.1680" | "ladspa.1767" | "ladspa.1771" | "ladspa.1772" | "ladspa.1773" | "ladspa.1779" | "ladspa.1788" | "ladspa.1795" | "ladspa.1845" | "ladspa.1846" | "ladspa.1848" | "ladspa.1882" | "ladspa.1883" | "ladspa.1886" | "ladspa.1887" | "ladspa.1888" | "ladspa.1889" | "ladspa.1890" | "ladspa.1891" | "ladspa.1892" | "ladspa.1893" | "ladspa.1894" | "ladspa.1895" | "ladspa.1896" | "ladspa.1897" | "ladspa.1898" | "ladspa.1899" | "ladspa.1900" | "ladspa.1901" | "ladspa.1902" | "ladspa.1903" | "ladspa.1904" | "ladspa.1905" | "ladspa.1907" | "ladspa.1908" | "ladspa.1909" | "ladspa.1910" | "ladspa.1913" | "ladspa.1914" | "ladspa.1915" | "ladspa.1916" | "ladspa.1917" | "ladspa.1941" | "ladspa.1942" | "ladspa.1943" | "ladspa.1944" | "ladspa.1945" | "ladspa.1946" | "ladspa.1947" | "ladspa.1948" | "ladspa.1949" | "ladspa.1951" | "ladspa.1952" | "ladspa.1953" | "ladspa.1954" | "ladspa.1955" | "ladspa.1956" | "ladspa.1957" | "ladspa.1958" | "ladspa.1960" | "ladspa.1961" | "ladspa.1962" | "ladspa.1963" | "ladspa.1964" | "ladspa.1965" | "ladspa.1966" | "ladspa.1967" | "ladspa.1968" | "ladspa.1970" | "ladspa.1973" | "ladspa.1974" | "ladspa.1975" | "ladspa.1976" | "ladspa.1977" | "ladspa.1978" | "ladspa.1979" | "ladspa.1980" | "ladspa.2021" | "ladspa.2022" | "ladspa.2023" | "ladspa.2024" | "ladspa.2025" | "ladspa.2026" | "ladspa.2027" | "ladspa.2028" | "ladspa.2029" | "ladspa.2030" | "ladspa.2031" | "ladspa.2032" | "ladspa.2034" | "ladspa.2035" | "ladspa.2036" | "ladspa.2141" | "ladspa.2142" | "ladspa.2143" | "ladspa.2144" | "ladspa.2145" | "ladspa.2146" | "ladspa.2147" | "ladspa.2148" | "ladspa.2149" | "ladspa.2150" | "ladspa.2151" | "ladspa.2152" | "ladspa.2153" | "ladspa.2154" | "ladspa.2155" | "ladspa.2156" | "ladspa.2157" | "ladspa.2158" | "ladspa.2159" | "ladspa.2184" | "ladspa.2185" | "ladspa.2186" | "ladspa.2586" | "ladspa.2588" | "ladspa.2589" | "ladspa.2592" | "ladspa.2593" | "ladspa.2594" | "ladspa.2595" | "ladspa.2598" | "ladspa.2601" | "ladspa.2602" | "ladspa.2603" | "ladspa.2606" | "ladspa.2607" | "ladspa.2608" | "ladspa.2609" | "ladspa.3301" | "ladspa.3302" | "ladspa.3303" | "ladspa.3304" | "ladspa.3305" | "ladspa.3306" | "ladspa.3307" | "ladspa.3308" | "ladspa.3309" | "ladspa.3311" | "ladspa.3312" | "ladspa.33917" | "ladspa.33918" | "ladspa.33919" | "ladspa.33922" | "ladspa.33923" | "ladspa.33924" | "ladspa.33951" | "ladspa.34049" | "ladspa.34050" | "ladspa.34051" | "ladspa.34052" | "ladspa.34053" | "ladspa.34065" | "ladspa.34066" | "ladspa.34067" | "ladspa.34068" | "ladspa.34069" | "ladspa.34070" | "ladspa.34071" | "ladspa.34080" | "ladspa.34081" | "ladspa.34096" | "ladspa.34097" | "ladspa.34098" | "ladspa.34184" | "ladspa.34185" | "ladspa.3701" | "ladspa.3702" | "ladspa.4061" | "ladspa.4062" | "ladspa.4063" | "ladspa.4064" | "ladspa.4065" | "ladspa.4066" | "ladspa.4067" | "ladspa.4068" | "ladspa.4221" | "lift_gamma_gain" | "lightshow" | "lines" | "loudness" | "loudness_meter" | "luma" | "lumakey" | "lumaliftgaingamma" | "mask_apply" | "mask_start" | "mirror" | "mono" | "movit.blur" | "movit.convert" | "movit.crop" | "movit.diffusion" | "movit.flip" | "movit.glow" | "movit.lift_gamma_gain" | "movit.mirror" | "movit.opacity" | "movit.rect" | "movit.resample" | "movit.resize" | "movit.saturation" | "movit.sharpen" | "movit.vignette" | "movit.white_balance" | "obscure" | "oldfilm" | "opencv.tracker" | "panner" | "pillar_echo" | "qtblend" | "qtcrop" | "qtext" | "rbpitch" | "resample" | "rescale" | "resize" | "rgblut" | "rotoscoping" | "sepia" | "shape" | "sox" | "sox.allpass" | "sox.band" | "sox.bandpass" | "sox.bandreject" | "sox.bass" | "sox.bend" | "sox.biquad" | "sox.channels" | "sox.chorus" | "sox.compand" | "sox.contrast" | "sox.dcshift" | "sox.deemph" | "sox.delay" | "sox.dither" | "sox.divide" | "sox.downsample" | "sox.earwax" | "sox.echo" | "sox.echos" | "sox.equalizer" | "sox.fade" | "sox.fir" | "sox.firfit" | "sox.flanger" | "sox.gain" | "sox.highpass" | "sox.hilbert" | "sox.ladspa" | "sox.loudness" | "sox.lowpass" | "sox.mcompand" | "sox.noiseprof" | "sox.noisered" | "sox.norm" | "sox.oops" | "sox.overdrive" | "sox.pad" | "sox.phaser" | "sox.pitch" | "sox.rate" | "sox.remix" | "sox.repeat" | "sox.reverb" | "sox.reverse" | "sox.riaa" | "sox.silence" | "sox.sinc" | "sox.spectrogram" | "sox.speed" | "sox.splice" | "sox.stat" | "sox.stats" | "sox.stretch" | "sox.swap" | "sox.synth" | "sox.tempo" | "sox.treble" | "sox.tremolo" | "sox.trim" | "sox.upsample" | "sox.vad" | "sox.vol" | "spot_remover" | "strobe" | "swresample" | "swscale" | "tcolor" | "telecide" | "text" | "threshold" | "timer" | "transition" | "typewriter" | "vidstab" | "vignette" | "volume" | "watermark" | "wave"
}

export class Transition extends Service<"transition"> {
    constructor(mlt_service: Transition.Services, properties: Record<string, string | number>, timestamp?: Timestamp) {
        super("transition", mlt_service, properties, timestamp)
    }
}
export namespace Transition {
    export type Services = "affine" | "composite" | "frei0r.addition" | "frei0r.addition_alpha" | "frei0r.alphaatop" | "frei0r.alphain" | "frei0r.alphainjection" | "frei0r.alphaout" | "frei0r.alphaover" | "frei0r.alphaxor" | "frei0r.blend" | "frei0r.burn" | "frei0r.cairoaffineblend" | "frei0r.cairoblend" | "frei0r.color_only" | "frei0r.composition" | "frei0r.darken" | "frei0r.difference" | "frei0r.divide" | "frei0r.dodge" | "frei0r.grain_extract" | "frei0r.grain_merge" | "frei0r.hardlight" | "frei0r.hue" | "frei0r.lighten" | "frei0r.multiply" | "frei0r.overlay" | "frei0r.saturation" | "frei0r.screen" | "frei0r.softlight" | "frei0r.subtract" | "frei0r.uvmap" | "frei0r.value" | "frei0r.xfade0r" | "luma" | "matte" | "mix" | "movit.luma_mix" | "movit.mix" | "movit.overlay" | "qtblend" | "vqm"
}


export class Playlist extends LinkableParentNode<"playlist"> {
    constructor(entries: Entry[]) {
        super("playlist", entries, {}, "entry")
    }
    static Blank(length: number) {
        return new Node("blank", {length})
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.children.push({element: producer, context: {timestamp}})
    }
}

class Multitrack extends ParentNode<"multitrack">{
    tracks: Producers[]
    constructor(tracks: Track[]) {
        super("multitrack", tracks, {}, "track")
        this.tracks = tracks.map(({element}) => element)
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.children.push({element: producer, context: {timestamp}})
        this.tracks.push(producer)
    }
}

export type LinkedFilter = {filter: Filter, track: Producers, timestamp?: Timestamp}
export type LinkedTransition = {transition: Transition, a_track: Producers, b_track: Producers, timestamp?: Timestamp}

class Tractor extends LinkableParentNode<"tractor"> {
    multitrack: Multitrack
    constructor(tracks: Track[], filters: LinkedFilter[]=[], transitions: LinkedTransition[]=[], timestamp?: Timestamp) {
        const linkedElements: ChildElement[] = Array(transitions.length+filters.length+1).fill(null)
        const multitrack = new Multitrack(tracks)
        linkedElements[0] = {element: multitrack, context: {}}
        
        for(let i = 0; i < filters.length; i++) {
            const {filter, track, ...rest} = filters[i]
            const trackIndex = multitrack.tracks.indexOf(track)
            if(trackIndex === -1) {throw new Error("Track not part of this Node")}
            linkedElements[i+1] = {element: filter, context: {children: [{element: Node.Property("track", trackIndex)}], ...rest}}
        }

        for(let i = 0; i < transitions.length; i++) {
            const {transition, a_track, b_track, ...rest} = transitions[i]
            const a_trackIndex = multitrack.tracks.indexOf(a_track)
            const b_trackIndex = multitrack.tracks.indexOf(b_track)
            if(a_trackIndex === -1 || b_trackIndex === -1) {throw new Error("Track not part of this Node")}
            linkedElements[i+filters.length+1] = {element: transition, context: {children: [{element: Node.Property("a_track", a_trackIndex)}, {element: Node.Property("b_track", b_trackIndex)}], ...rest}}
        }
        super("tractor", linkedElements, timestamp)
        this.multitrack = multitrack
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.multitrack.addTrack(producer, timestamp)
    }
    addFilter(filter: Filter, track: Producers, timestamp: Timestamp = {}) {
        const trackIndex = this.multitrack.tracks.indexOf(track)
        if(trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.children.push({element: filter, context: {children: [{element: Node.Property("track", trackIndex)}], timestamp}})
    } 
    addTransition(transition: Transition, a_track: Producers, b_track: Producers, timestamp: Timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track)
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track)
        if(a_trackIndex === -1 || b_trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.children.push({element: transition, context: {children: [{element: Node.Property("a_track", a_trackIndex)}, {element: Node.Property("b_track", b_trackIndex)}], timestamp}})
    }
}

export class MLT {
    constructor(profile: Record<string, string | number>) {

    }
    static nodeCrawler(node: ParentNode<any> | LinkableParentNode<any>, map: Map<string, Set<ParentNode<any> | LinkableParentNode<any>>> = new Map()) {
        for(const {element: child} of node.children) {
            if("linked" in child) {
                if(map.has(child.id.id)) {
                    map.get(child.id.id)!.add(node)
                } else {
                    map.set(child.id.id, new Set([node]))
                }
            }
            if("children" in child) {
                MLT.nodeCrawler(child, map)
            }
        }
    }
}