import { Service } from "../nodes.js";
export class Filter extends Service {
    constructor(mlt_service, properties, timestamp) {
        super("filter", mlt_service, properties, timestamp);
    }
}
