import { LinkableParentNode, ParentNode, ChildElement, Node, Timestamp } from "../nodes.js"
import { Track, Producers } from "../mlt.js"
import { Transition } from "./transition.js"
import { Filter } from "./filter.js"

class Multitrack extends ParentNode<"multitrack">{
    tracks: Producers[]
    constructor(tracks: Track[]) {
        super("multitrack", tracks, {}, "track")
        this.tracks = tracks.map(({element}) => element)
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.children.push({element: producer, context: {timestamp}})
        this.tracks.push(producer)
        return this
    }
}

export type LinkedFilter = {filter: Filter, track: Producers, timestamp?: Timestamp}
export type LinkedTransition = {transition: Transition, a_track: Producers, b_track: Producers, timestamp?: Timestamp}

export class Tractor extends LinkableParentNode<"tractor"> {
    multitrack: Multitrack
    constructor(tracks: Track[], filters: LinkedFilter[]=[], transitions: LinkedTransition[]=[], timestamp?: Timestamp) {
        const linkedElements: ChildElement[] = Array(transitions.length+filters.length+1).fill(null)
        const multitrack = new Multitrack(tracks)
        linkedElements[0] = {element: multitrack, context: {}}
        
        for(let i = 0; i < filters.length; i++) {
            const {filter, track, ...rest} = filters[i]
            const trackIndex = multitrack.tracks.indexOf(track)
            if(trackIndex === -1) {throw new Error("Track not part of this Node")}
            linkedElements[i+1] = {element: filter, context: {children: [{element: Node.Property("track", trackIndex)}], ...rest}}
        }

        for(let i = 0; i < transitions.length; i++) {
            const {transition, a_track, b_track, ...rest} = transitions[i]
            const a_trackIndex = multitrack.tracks.indexOf(a_track)
            const b_trackIndex = multitrack.tracks.indexOf(b_track)
            if(a_trackIndex === -1 || b_trackIndex === -1) {throw new Error("Track not part of this Node")}
            linkedElements[i+filters.length+1] = {element: transition, context: {children: [{element: Node.Property("a_track", a_trackIndex)}, {element: Node.Property("b_track", b_trackIndex)}], ...rest}}
        }
        super("tractor", linkedElements, timestamp)
        this.multitrack = multitrack
    }
    addTrack(producer: Producers, timestamp: Timestamp = {}) {
        this.multitrack.addTrack(producer, timestamp)
        return this
    }
    addFilter(filter: Filter, track: Producers, timestamp: Timestamp = {}) {
        const trackIndex = this.multitrack.tracks.indexOf(track)
        if(trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.children.push({element: filter, context: {children: [{element: Node.Property("track", trackIndex)}], timestamp}})
        return this
    } 
    addTransition(transition: Transition, a_track: Producers, b_track: Producers, timestamp: Timestamp = {}) {
        const a_trackIndex = this.multitrack.tracks.indexOf(a_track)
        const b_trackIndex = this.multitrack.tracks.indexOf(b_track)
        if(a_trackIndex === -1 || b_trackIndex === -1) {throw new Error("Track not part of this Node")}
        this.children.push({element: transition, context: {children: [{element: Node.Property("a_track", a_trackIndex)}, {element: Node.Property("b_track", b_trackIndex)}], timestamp}})
        return this
    }
}
