"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Playlist = void 0;
const nodes_js_1 = require("../nodes.js");
class Playlist extends nodes_js_1.LinkableParentNode {
    constructor(entries) {
        super("playlist", entries, {}, "entry");
    }
    static Blank(length) {
        return new nodes_js_1.Node("blank", { length });
    }
    addTrack(producer, timestamp = {}) {
        this.children.push({ element: producer, context: { timestamp } });
        return this;
    }
}
exports.Playlist = Playlist;
