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
const mlt_js_1 = require("../mlt.js");
var Tractor;
(function (Tractor) {
    class Builder {
        constructor() {
            this.multitrackBuilder = new mlt_js_1.NodeBuilder("multitrack", "track");
            this.builder = new mlt_js_1.NodeBuilder("tractor");
        }
        addEntry(entry, timestamp = {}) {
            //Truly an insane type assertion i have to make here but whatever im probably just dumb 😤
            this.multitrackBuilder.addChild({ node: entry, context: timestamp });
            return this;
        }
        addFilter(filter, track) {
            const index = this.multitrackBuilder.indexOf(track);
            this.builder.addChild({ node: filter, context: { track: index } });
            return this;
        }
        addTransition(transition, a_track, b_track) {
            const a_index = this.multitrackBuilder.indexOf(a_track);
            const b_index = this.multitrackBuilder.indexOf(b_track);
            this.builder.addChild({ node: transition, context: { a_track: a_index, b_track: b_index } });
            return this;
        }
        build() {
            const multitrack = this.multitrackBuilder.build(() => { return {}; });
            this.builder.addChild({ node: multitrack, context: {} });
            this.builder.children.reverse();
            return this.builder.build((_a) => { var { linkName = undefined } = _a, timestamp = __rest(_a, ["linkName"]); return { timestamp }; }, true);
        }
    }
    Tractor.Builder = Builder;
})(Tractor = exports.Tractor || (exports.Tractor = {}));
