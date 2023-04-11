import { NodeBuilder } from "../mlt.js";
function Blank(length) {
    return {
        name: "blank",
        getXML: () => NodeBuilder.getElementTags("blank", { length }, true)
    };
}
export var Playlist;
(function (Playlist) {
    class Builder {
        builder = new NodeBuilder("playlist", "entry");
        addEntry(entry, timestamp = {}) {
            //Truly an insane type assertion i have to make here but whatever im probably just dumb 😤
            this.builder.addChild({ node: entry, context: timestamp });
            return this;
        }
        addBlank(length) {
            this.builder.addChild({ node: Blank(length), context: {} });
            return this;
        }
        build() {
            return this.builder.build(({ linkName = undefined, ...timestamp }) => { return { timestamp }; }, true);
        }
    }
    Playlist.Builder = Builder;
})(Playlist || (Playlist = {}));
