import { Service } from "../nodes.js";
export class Consumer extends Service {
    constructor(mlt_service, properties, timestamp) {
        super("consumer", mlt_service, properties, timestamp);
    }
}
(function (Consumer) {
    function Video(path, timestamp) {
        return new Consumer("avformat", { resource: path }, timestamp);
    }
    Consumer.Video = Video;
})(Consumer || (Consumer = {}));
