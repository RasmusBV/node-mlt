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
exports.Tractor = void 0;
const nodes_js_1 = require("../nodes.js");
class Multitrack extends nodes_js_1.ParentNode {
    constructor(tracks) {
        super("multitrack", tracks, {}, "track");
        this.tracks = tracks.map(({ element }) => element);
    }
    addTrack(producer, timestamp = {}) {
        this.children.push({ element: producer, context: { timestamp } });
        this.tracks.push(producer);
        return this;
    }
}
class Tractor extends nodes_js_1.LinkableParentNode {
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
            linkedElements[i + 1] = { element: filter, context: Object.assign({ children: [{ element: nodes_js_1.Node.Property("track", trackIndex) }] }, rest) };
        }
        for (let i = 0; i < transitions.length; i++) {
            const _b = transitions[i], { transition, a_track, b_track } = _b, rest = __rest(_b, ["transition", "a_track", "b_track"]);
            const a_trackIndex = multitrack.tracks.indexOf(a_track);
            const b_trackIndex = multitrack.tracks.indexOf(b_track);
            if (a_trackIndex === -1 || b_trackIndex === -1) {
                throw new Error("Track not part of this Node");
            }
            linkedElements[i + filters.length + 1] = { element: transition, context: Object.assign({ children: [{ element: nodes_js_1.Node.Property("a_track", a_trackIndex) }, { element: nodes_js_1.Node.Property("b_track", b_trackIndex) }] }, rest) };
        }
        super("tractor", linkedElements, timestamp);
        this.multitrack = multitrack;
    }
    addTrack(producer, timestamp = {}) {
        this.multitrack.addTrack(producer, timestamp);
        return this;
    }
    addFilter(filter, track, timestamp = {}) {
        const trackIndex = this.multitrack.tracks.indexOf(track);
        if (trackIndex === -1) {
            throw new Error("Track not part of this Node");
        }
        this.children.push({ element: filter, context: { children: [{ element: nodes_js_1.Node.Property("track", trackIndex) }], timestamp } });
        return this;
    }
    addTransition(transition, a_track, b_track, timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track);
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track);
        if (a_trackIndex === -1 || b_trackIndex === -1) {
            throw new Error("Track not part of this Node");
        }
        this.children.push({ element: transition, context: { children: [{ element: nodes_js_1.Node.Property("a_track", a_trackIndex) }, { element: nodes_js_1.Node.Property("b_track", b_trackIndex) }], timestamp } });
        return this;
    }
}
exports.Tractor = Tractor;
