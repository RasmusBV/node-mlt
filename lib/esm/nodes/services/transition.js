import { NodeBuilder, Property } from "../../mlt.js";
export var Transition;
(function (Transition) {
    class Builder {
        builder = new NodeBuilder("transition");
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
            return this.builder.build(({ a_track, b_track, linkName = undefined, ...timestamp }) => {
                return {
                    children: [
                        { node: Property("a_track", a_track), context: {} },
                        { node: Property("b_track", b_track), context: {} }
                    ],
                    timestamp
                };
            });
        }
    }
    Transition.Builder = Builder;
})(Transition || (Transition = {}));
