import { LinkableParentNode, ParentNode, Timestamp, Property } from "../nodes"
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

export class Tractor {
    multitrack: Multitrack
    node: LinkableParentNode
    constructor(tracks: Tractor.Track[])
    constructor(tracks: Tractor.Track[], filters: (Tractor.LinkedFilter[] | Tractor.LinkedTransition[]))
    constructor(tracks: Tractor.Track[], filters: Tractor.LinkedFilter[], transitions: Tractor.LinkedTransition[], timestamp?: Timestamp)
    constructor(tracks: Tractor.Track[], filters?: (Tractor.LinkedFilter[] | Tractor.LinkedTransition[]), transitions?: Tractor.LinkedTransition[], timestamp?: Timestamp) {
        this.multitrack = new Multitrack(tracks)
        this.node = new LinkableParentNode("tractor", [{element: this.multitrack}], timestamp)
        if(filters) {
            for(let i = 0; i < filters.length; i++) {
                if("filter" in filters[i]) {
                    const {filter, track, timestamp = {}} = filters[i] as Tractor.LinkedFilter
                    this.addFilter(filter, track, timestamp)
                } else {
                    const {transition, a_track, b_track, timestamp = {}} = filters[i] as Tractor.LinkedTransition
                    this.addTransition(transition, a_track, b_track, timestamp) 
                }
                
            }
        }
        if(transitions) {
            for(let i = 0; i < transitions.length; i++) {
                const {transition, a_track, b_track, timestamp = {}} = transitions[i]
                this.addTransition(transition, a_track, b_track, timestamp)
            }
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
    export type LinkedFilter = {filter: Filter, track: Producers, timestamp?: Timestamp}
    export type LinkedTransition = {transition: Transition, a_track: Producers, b_track: Producers, timestamp?: Timestamp}
}