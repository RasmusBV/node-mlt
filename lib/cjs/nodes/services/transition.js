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
exports.Transition = void 0;
const mlt_js_1 = require("../../mlt.js");
var Transition;
(function (Transition) {
    class Builder {
        constructor(mlt_service) {
            this.builder = new mlt_js_1.NodeBuilder("transition");
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
                var { a_track, b_track, linkName = undefined } = _a, timestamp = __rest(_a, ["a_track", "b_track", "linkName"]);
                return {
                    children: [
                        { node: (0, mlt_js_1.Property)("a_track", a_track), context: {} },
                        { node: (0, mlt_js_1.Property)("b_track", b_track), context: {} }
                    ],
                    timestamp
                };
            });
        }
    }
    Transition.Builder = Builder;
})(Transition = exports.Transition || (exports.Transition = {}));
