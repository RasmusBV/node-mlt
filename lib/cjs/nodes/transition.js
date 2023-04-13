"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transition = void 0;
const nodes_js_1 = require("../nodes.js");
class Transition extends nodes_js_1.Service {
    constructor(mlt_service, properties, timestamp) {
        super("transition", mlt_service, properties, timestamp);
    }
}
exports.Transition = Transition;
