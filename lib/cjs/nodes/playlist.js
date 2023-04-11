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
exports.Playlist = void 0;
const mlt_js_1 = require("../mlt.js");
function Blank(length) {
    return {
        name: "blank",
        getXML: () => mlt_js_1.NodeBuilder.getElementTags("blank", { length }, true)
    };
}
var Playlist;
(function (Playlist) {
    class Builder {
        constructor() {
            this.builder = new mlt_js_1.NodeBuilder("playlist", "entry");
        }
        addEntry(entry, timestamp = {}) {
            //Truly an insane type assertion i have to make here but whatever im probably just dumb 😤
            this.builder.addChild({ node: entry, context: timestamp });
            return this;
        }
        addBlank(length) {
            this.builder.addChild({ node: Blank(length), context: {} });
            return this;
        }
        build() {
            return this.builder.build((_a) => { var { linkName = undefined } = _a, timestamp = __rest(_a, ["linkName"]); return { timestamp }; }, true);
        }
    }
    Playlist.Builder = Builder;
})(Playlist = exports.Playlist || (exports.Playlist = {}));
