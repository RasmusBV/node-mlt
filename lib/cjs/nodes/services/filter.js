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
exports.Filter = void 0;
const mlt_js_1 = require("../../mlt.js");
var Filter;
(function (Filter) {
    class Builder {
        constructor(mlt_service) {
            this.builder = new mlt_js_1.NodeBuilder("filter");
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
            return this.builder.build((_a) => {
                var { track, linkName = undefined } = _a, timestamp = __rest(_a, ["track", "linkName"]);
                const children = track ? [{ node: (0, mlt_js_1.Property)("track", track), context: {} }] : [];
                return {
                    children,
                    timestamp
                };
            });
        }
    }
    Filter.Builder = Builder;
    function Lumakey() {
        return new Builder("lumakey").build();
    }
    Filter.Lumakey = Lumakey;
})(Filter = exports.Filter || (exports.Filter = {}));
