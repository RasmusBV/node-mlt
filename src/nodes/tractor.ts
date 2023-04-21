import { LinkableParentNode, ParentNode, ChildElement, Node, Timestamp, Property } from "../nodes"
import { Producers } from "../document"
import { Transition } from "./transition"
import { Filter } from "./filter"

class Multitrack {
    node: ParentNode
    tracks: string[]
    constructor(tracks: Tractor.Track[]) {
        this.node = new ParentNode("multitrack", tracks, {}, "track")
        this.tracks = tracks.map(({element: {node: {id}}}) => id)
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.node.addChild(producer, timestamp)
        this.tracks.push(producer.node.id)
        return this
    }
}

export type LinkedFilter = {filter: Filter, track: Producers, timestamp?: Timestamp}
export type LinkedTransition = {transition: Transition, a_track: Producers, b_track: Producers, timestamp?: Timestamp}

export class Tractor {
    private multitrack: Multitrack
    node: LinkableParentNode
    constructor(tracks: Tractor.Track[], filters: LinkedFilter[]=[], transitions: LinkedTransition[]=[], timestamp?: Timestamp) {
        this.multitrack = new Multitrack(tracks)
        this.node = new LinkableParentNode("tractor", [{element: this.multitrack}], timestamp)
        for(let i = 0; i < filters.length; i++) {
            const {filter, track, timestamp = {}} = filters[i]
            this.addFilter(filter, track, timestamp)
        }
        for(let i = 0; i < transitions.length; i++) {
            const {transition, a_track, b_track, timestamp = {}} = transitions[i]
            this.addTransition(transition, a_track, b_track, timestamp)
        }
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.multitrack.addTrack(producer, timestamp)
        return this
    }
    addFilter(filter: Filter, track: Producers, timestamp: Timestamp = {}) {
        const trackIndex = this.multitrack.tracks.indexOf(track.node.id)
        if(trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.node.addChild(filter, timestamp, [{element: new Property("track", trackIndex)}])
        return this
    } 
    addTransition(transition: Transition, a_track: Producers, b_track: Producers, timestamp: Timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track.node.id)
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track.node.id)
        if(a_trackIndex === -1 || b_trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.node.addChild(transition, timestamp, [{element: new Property("a_track", a_trackIndex)}, {element: new Property("b_track", b_trackIndex)}])
        return this
    }
}

export namespace Tractor {
    export type Track = {element: Producers, timestamp?: Timestamp}
}