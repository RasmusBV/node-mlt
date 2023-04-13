"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Filter = void 0;
const nodes_js_1 = require("../nodes.js");
class Filter extends nodes_js_1.Service {
    constructor(mlt_service, properties, timestamp) {
        super("filter", mlt_service, properties, timestamp);
    }
}
exports.Filter = Filter;
