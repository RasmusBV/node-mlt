import { NodeBuilder, Property } from "../../mlt.js";
export var Filter;
(function (Filter) {
    class Builder {
        builder = new NodeBuilder("filter");
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
            return this.builder.build(({ track, linkName = undefined, ...timestamp }) => {
                const children = track ? [{ node: Property("track", track), context: {} }] : [];
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
})(Filter || (Filter = {}));
