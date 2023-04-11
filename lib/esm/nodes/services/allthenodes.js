import { LinkableParentNode, Node, ParentNode } from "../../new-mlt";
export class Producer extends LinkableParentNode {
    constructor(mlt_service, properties, timestamp) {
        const children = Node.mapPropertiesToNodes(properties);
        children.push({ element: Node.Property("mlt_service", mlt_service) });
        super("producer", children, timestamp);
    }
}
(function (Producer) {
    function Image(path, timestamp) {
        return new Producer("pixbuf", { resource: path }, timestamp);
    }
    Producer.Image = Image;
    function Video(path, timestamp) {
        return new Producer("avformat", { resource: path }, timestamp);
    }
    Producer.Video = Video;
})(Producer || (Producer = {}));
export class Consumer extends ParentNode {
    constructor(mlt_service, properties, timestamp) {
        const children = Node.mapPropertiesToNodes(properties);
        children.push({ element: Node.Property("mlt_service", mlt_service) });
        super("consumer", children, timestamp);
    }
}
(function (Consumer) {
    function Video(path, timestamp) {
        return new Consumer("avformat", { resource: path }, timestamp);
    }
    Consumer.Video = Video;
})(Consumer || (Consumer = {}));
export class Filter extends ParentNode {
    constructor(mlt_service, properties, timestamp = {}) {
        const children = Node.mapPropertiesToNodes(properties);
        children.push({ element: Node.Property("mlt_service", mlt_service) });
        super("filter", children, timestamp);
    }
}
export class Transition extends ParentNode {
    constructor(mlt_service, properties, timestamp = {}) {
        const children = Node.mapPropertiesToNodes(properties);
        children.push({ element: Node.Property("mlt_service", mlt_service) });
        super("transition", children, timestamp);
    }
}
export class Playlist extends LinkableParentNode {
    constructor(entries) {
        super("playlist", entries, {}, "entry");
    }
    static Blank(length) {
        return new Node("blank", { length });
    }
}
class Multitrack extends ParentNode {
    tracks;
    constructor(tracks) {
        super("multitrack", tracks, {}, "track");
        this.tracks = tracks.map(({ element }) => element);
    }
    addTrack(producer, timestamp = {}) {
        this.children.push({ element: producer, context: { timestamp } });
        this.tracks.push(producer);
    }
}
class Tractor extends LinkableParentNode {
    multitrack;
    constructor(tracks, filters = [], transitions = [], timestamp) {
        const linkedElements = Array(transitions.length + filters.length + 1).fill(null);
        const multitrack = new Multitrack(tracks);
        linkedElements[0] = { element: multitrack, context: {} };
        for (let i = 0; i < filters.length; i++) {
            const { filter, track, ...rest } = filters[i];
            const trackIndex = multitrack.tracks.indexOf(track);
            if (trackIndex === -1) {
                throw new Error("Track not part of this Node");
            }
            linkedElements[i + 1] = { element: filter, context: { children: [{ element: Node.Property("track", trackIndex) }], ...rest } };
        }
        for (let i = 0; i < transitions.length; i++) {
            const { transition, a_track, b_track, ...rest } = transitions[i];
            const a_trackIndex = multitrack.tracks.indexOf(a_track);
            const b_trackIndex = multitrack.tracks.indexOf(b_track);
            if (a_trackIndex === -1 || b_trackIndex === -1) {
                throw new Error("Track not part of this Node");
            }
            linkedElements[i + filters.length + 1] = { element: transition, context: { children: [{ element: Node.Property("a_track", a_trackIndex) }, { element: Node.Property("b_track", b_trackIndex) }], ...rest } };
        }
        super("tractor", linkedElements, timestamp);
        this.multitrack = multitrack;
    }
    addTrack(producer, timestamp = {}) {
        this.multitrack.addTrack(producer, timestamp);
    }
    addFilter(filter, track, timestamp = {}) {
        const trackIndex = this.multitrack.tracks.indexOf(track);
        if (trackIndex === -1) {
            throw new Error("Track not part of this Node");
        }
        this.children.push({ element: filter, context: { children: [{ element: Node.Property("track", trackIndex) }], timestamp } });
    }
    addTransition(transition, a_track, b_track, timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track);
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track);
        if (a_trackIndex === -1 || b_trackIndex === -1) {
            throw new Error("Track not part of this Node");
        }
        this.children.push({ element: transition, context: { children: [{ element: Node.Property("a_track", a_trackIndex) }, { element: Node.Property("b_track", b_trackIndex) }], timestamp } });
    }
}
const alan1 = Producer.Image("Mel og vadn");
const alan2 = Producer.Video("Vand og æg", { in: 200, out: 500 });
const playlist1 = new Playlist([
    { element: alan1, context: { timestamp: { in: 300, out: 500 } } },
    { element: alan2, context: {} },
    { element: alan2, context: { timestamp: { in: 0, out: 200 } } }
]);
const filter1 = new Filter("greyscale", {});
const tractor = new Tractor([
    { element: alan1, context: {} },
    { element: playlist1, context: {} }
], [
    { filter: filter1, track: alan1 }
]);
tractor.addFilter(filter1, playlist1, { in: 0, out: 100 });
console.log(tractor.getXML({}));
