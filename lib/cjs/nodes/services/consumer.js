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
exports.Consumer = void 0;
const mlt_js_1 = require("../../mlt.js");
var Consumer;
(function (Consumer) {
    class Builder {
        constructor(mlt_service) {
            this.builder = new mlt_js_1.NodeBuilder("consumer");
            this.builder.addChild({ node: (0, mlt_js_1.Property)("mlt_service", mlt_service), context: {} });
        }
        addTimestamp(timestamp) {
            this.builder.addTimestamp(timestamp);
            return this;
        }
        addProperty(name, value) {
            this.builder.addChild({ node: (0, mlt_js_1.Property)(name, value), context: {} });
            return this;
        }
        build() {
            return this.builder.build((_a) => { var { linkName = undefined } = _a, timestamp = __rest(_a, ["linkName"]); return { timestamp }; });
        }
    }
    Consumer.Builder = Builder;
    function Video(path, timestamp = {}) {
        return new Builder("avformat")
            .addTimestamp(timestamp)
            .addProperty("resource", path)
            .build();
    }
    Consumer.Video = Video;
})(Consumer = exports.Consumer || (exports.Consumer = {}));
