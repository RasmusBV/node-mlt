import { LinkableParentNode, ParentNode, ChildElement, Node, Timestamp, Property } from "../nodes"
import { Track, Producers } from "../document"
import { Transition } from "./transition"
import { Filter } from "./filter"

class Multitrack {
    node: ParentNode
    tracks: LinkableParentNode[]
    constructor(tracks: Track[]) {
        this.node = new ParentNode("multitrack", tracks, {}, "track")
        this.tracks = tracks.map(({element: {node}}) => node)
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.node.children.push({element: producer, context: {timestamp}})
        this.tracks.push(producer.node)
        return this
    }
}

export type LinkedFilter = {filter: Filter, track: Producers, timestamp?: Timestamp}
export type LinkedTransition = {transition: Transition, a_track: Producers, b_track: Producers, timestamp?: Timestamp}

export class Tractor {
    private multitrack: Multitrack
    node: LinkableParentNode
    constructor(tracks: Track[], filters: LinkedFilter[]=[], transitions: LinkedTransition[]=[], timestamp?: Timestamp) {
        this.multitrack = new Multitrack(tracks)
        this.node = new LinkableParentNode("tractor", [{element: this.multitrack, context: {}}], timestamp)
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
        const trackIndex = this.multitrack.tracks.indexOf(track.node)
        if(trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.node.children.push({element: filter, context: {children: [{element: new Property("track", trackIndex)}], timestamp}})
        return this
    } 
    addTransition(transition: Transition, a_track: Producers, b_track: Producers, timestamp: Timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track.node)
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track.node)
        if(a_trackIndex === -1 || b_trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.node.children.push({element: transition, context: {children: [{element: new Property("a_track", a_trackIndex)}, {element: new Property("b_track", b_trackIndex)}], timestamp}})
        return this
    }
}