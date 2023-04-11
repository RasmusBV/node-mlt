"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = exports.Transition = exports.Filter = exports.Consumer = exports.Producer = void 0;
const new_mlt_1 = require("../../new-mlt");
class Producer extends new_mlt_1.LinkableParentNode {
    constructor(mlt_service, properties, timestamp) {
        const children = new_mlt_1.Node.mapPropertiesToNodes(properties);
        children.push({ element: new_mlt_1.Node.Property("mlt_service", mlt_service) });
        super("producer", children, timestamp);
    }
}
exports.Producer = Producer;
(function (Producer) {
    function Image(path, timestamp) {
        return new Producer("pixbuf", { resource: path }, timestamp);
    }
    Producer.Image = Image;
    function Video(path, timestamp) {
        return new Producer("avformat", { resource: path }, timestamp);
    }
    Producer.Video = Video;
})(Producer = exports.Producer || (exports.Producer = {}));
class Consumer extends new_mlt_1.ParentNode {
    constructor(mlt_service, properties, timestamp) {
        const children = new_mlt_1.Node.mapPropertiesToNodes(properties);
        children.push({ element: new_mlt_1.Node.Property("mlt_service", mlt_service) });
        super("consumer", children, timestamp);
    }
}
exports.Consumer = Consumer;
(function (Consumer) {
    function Video(path, timestamp) {
        return new Consumer("avformat", { resource: path }, timestamp);
    }
    Consumer.Video = Video;
})(Consumer = exports.Consumer || (exports.Consumer = {}));
class Filter extends new_mlt_1.ParentNode {
    constructor(mlt_service, properties, timestamp = {}) {
        const children = new_mlt_1.Node.mapPropertiesToNodes(properties);
        children.push({ element: new_mlt_1.Node.Property("mlt_service", mlt_service) });
        super("filter", children, timestamp);
    }
}
exports.Filter = Filter;
class Transition extends new_mlt_1.ParentNode {
    constructor(mlt_service, properties, timestamp = {}) {
        const children = new_mlt_1.Node.mapPropertiesToNodes(properties);
        children.push({ element: new_mlt_1.Node.Property("mlt_service", mlt_service) });
        super("transition", children, timestamp);
    }
}
exports.Transition = Transition;
class Playlist extends new_mlt_1.LinkableParentNode {
    constructor(entries) {
        super("playlist", entries, {}, "entry");
    }
    static Blank(length) {
        return new new_mlt_1.Node("blank", { length });
    }
}
exports.Playlist = Playlist;
class Multitrack extends new_mlt_1.ParentNode {
    constructor(tracks) {
        super("multitrack", tracks, {}, "track");
        this.tracks = tracks.map(({ element }) => element);
    }
    addTrack(producer, timestamp = {}) {
        this.children.push({ element: producer, context: { timestamp } });
        this.tracks.push(producer);
    }
}
class Tractor extends new_mlt_1.LinkableParentNode {
    constructor(tracks, filters = [], transitions = [], timestamp) {
        const linkedElements = Array(transitions.length + filters.length + 1).fill(null);
        const multitrack = new Multitrack(tracks);
        linkedElements[0] = { element: multitrack, context: {} };
        for (let i = 0; i < filters.length; i++) {
            const _a = filters[i], { filter, track } = _a, rest = __rest(_a, ["filter", "track"]);
            const trackIndex = multitrack.tracks.indexOf(track);
            if (trackIndex === -1) {
                throw new Error("Track not part of this Node");
            }
            linkedElements[i + 1] = { element: filter, context: Object.assign({ children: [{ element: new_mlt_1.Node.Property("track", trackIndex) }] }, rest) };
        }
        for (let i = 0; i < transitions.length; i++) {
            const _b = transitions[i], { transition, a_track, b_track } = _b, rest = __rest(_b, ["transition", "a_track", "b_track"]);
            const a_trackIndex = multitrack.tracks.indexOf(a_track);
            const b_trackIndex = multitrack.tracks.indexOf(b_track);
            if (a_trackIndex === -1 || b_trackIndex === -1) {
                throw new Error("Track not part of this Node");
            }
            linkedElements[i + filters.length + 1] = { element: transition, context: Object.assign({ children: [{ element: new_mlt_1.Node.Property("a_track", a_trackIndex) }, { element: new_mlt_1.Node.Property("b_track", b_trackIndex) }] }, rest) };
        }
        super("tractor", linkedElements, timestamp);
        this.multitrack = multitrack;
    }
    addTrack(producer, timestamp = {}) {
        this.multitrack.addTrack(producer, timestamp);
    }
    addFilter(filter, track, timestamp = {}) {
        const trackIndex = this.multitrack.tracks.indexOf(track);
        if (trackIndex === -1) {
            throw new Error("Track not part of this Node");
        }
        this.children.push({ element: filter, context: { children: [{ element: new_mlt_1.Node.Property("track", trackIndex) }], timestamp } });
    }
    addTransition(transition, a_track, b_track, timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track);
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track);
        if (a_trackIndex === -1 || b_trackIndex === -1) {
            throw new Error("Track not part of this Node");
        }
        this.children.push({ element: transition, context: { children: [{ element: new_mlt_1.Node.Property("a_track", a_trackIndex) }, { element: new_mlt_1.Node.Property("b_track", b_trackIndex) }], timestamp } });
    }
}
const alan1 = Producer.Image("Mel og vadn");
const alan2 = Producer.Video("Vand og æg", { in: 200, out: 500 });
const playlist1 = new Playlist([
    { element: alan1, context: { timestamp: { in: 300, out: 500 } } },
    { element: alan2, context: {} },
    { element: alan2, context: { timestamp: { in: 0, out: 200 } } }
]);
const filter1 = new Filter("greyscale", {});
const tractor = new Tractor([
    { element: alan1, context: {} },
    { element: playlist1, context: {} }
], [
    { filter: filter1, track: alan1 }
]);
tractor.addFilter(filter1, playlist1, { in: 0, out: 100 });
console.log(tractor.getXML({}));
