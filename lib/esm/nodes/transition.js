import { Service } from "../nodes.js";
export class Transition extends Service {
    constructor(mlt_service, properties, timestamp) {
        super("transition", mlt_service, properties, timestamp);
    }
}
