import { NodeBuilder, Property } from "../../mlt.js";
export var Consumer;
(function (Consumer) {
    class Builder {
        builder = new NodeBuilder("consumer");
        constructor(mlt_service) {
            this.builder.addChild({ node: Property("mlt_service", mlt_service), context: {} });
        }
        addTimestamp(timestamp) {
            this.builder.addTimestamp(timestamp);
            return this;
        }
        addProperty(name, value) {
            this.builder.addChild({ node: Property(name, value), context: {} });
            return this;
        }
        build() {
            return this.builder.build(({ linkName = undefined, ...timestamp }) => { return { timestamp }; });
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
})(Consumer || (Consumer = {}));
