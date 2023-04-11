import { NodeBuilder, Property } from "../../mlt.js";
export var Producer;
(function (Producer) {
    class Builder {
        builder = new NodeBuilder("producer");
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
            return this.builder.build(({ linkName = undefined, ...timestamp }) => { return { timestamp }; }, true);
        }
    }
    Producer.Builder = Builder;
    function Image(path, timestamp = {}) {
        return new Builder("pixbuf")
            .addTimestamp(timestamp)
            .addProperty("resource", path)
            .build();
    }
    Producer.Image = Image;
    function Video(path, timestamp = {}) {
        return new Builder("avformat")
            .addTimestamp(timestamp)
            .addProperty("resource", path)
            .build();
    }
    Producer.Video = Video;
})(Producer || (Producer = {}));
