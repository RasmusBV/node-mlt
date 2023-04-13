"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Consumer = void 0;
const nodes_js_1 = require("../nodes.js");
class Consumer extends nodes_js_1.Service {
    constructor(mlt_service, properties, timestamp) {
        super("consumer", mlt_service, properties, timestamp);
    }
}
exports.Consumer = Consumer;
(function (Consumer) {
    function Video(path, timestamp) {
        return new Consumer("avformat", { resource: path }, timestamp);
    }
    Consumer.Video = Video;
})(Consumer = exports.Consumer || (exports.Consumer = {}));
