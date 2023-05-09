import { Producers } from '../document'
import { MLT, Playlist } from '../index'
import { FinishedElement } from './DOMBuilder'

export class DOMCrawler {
    idTable: {
        producer: Record<string, MLT.Producer>
        consumer: Record<string, MLT.Consumer>
        transition: Record<string, MLT.Transition>
        filter: Record<string, MLT.Filter>
        playlist: Record<string, MLT.Playlist>
        tractors: Record<string, MLT.Tractor>
    } = {
        producer: {},
        consumer: {},
        transition: {},
        filter: {},
        playlist: {},
        tractors: {}
    }
    getProducersById(id: string) {
        if(id in this.idTable.producer) {
            return this.idTable.producer[id]
        }
        if(id in this.idTable.playlist) {
            return this.idTable.playlist[id]
        }
        if(id in this.idTable.tractors) {
            return this.idTable.tractors[id]
        }
        throw new Error("Entry or Track references unknown id")
    }
    crawl(node: FinishedElement<"mlt">) {
        let filters: MLT.Filter[] = []
        let consumer: MLT.Consumer | undefined
        let root: Producers | undefined
        node.children.forEach((child) => {
            switch (child.name) {
                case "filter": {
                    filters.push(this.constructFilter(child).filter)
                    break;
                } case "consumer": {
                    if(consumer) {
                        throw new Error("Multiple consumers not supported")
                    }
                    consumer = this.constructConsumer(child).consumer
                    break;
                } case "playlist": {
                    root = this.constructPlaylist(child).playlist
                    break;
                } case "producer": {
                    root = this.constructProducer(child).producer
                    break;
                } case "tractor": {
                    root = this.constructTractor(child).tractor
                    break;
                }
            }
        })
        return {root, filters, consumer}
    }
    constructTractor(node: FinishedElement<"tractor">) {
        let foundMultitrack = false
        const {id = undefined, ...timestamp} = node.attributes
        let entries: MLT.Tractor.Track[] | undefined
        for(const element of node.children) {
            if(element.name === "multitrack") {
                if(foundMultitrack === true) {throw new Error("Only one Multitrack allowed per Tractor")}
                foundMultitrack = true
                entries = this.constructMultitrack(element)
            }
        }
        if(!entries) {
            throw new Error("No Multitrack found in tractor")
        }
        const transitions: MLT.Tractor.LinkedTransition[] = []
        const filters: MLT.Tractor.LinkedFilter[] = []
        for(const element of node.children) {
            if(element.name === "filter") {
                const {filter, track: trackIndex, timestamp} = this.constructFilter(element)
                if(trackIndex === undefined) {throw new Error("Filters in Tractors must reference a track")}
                if(entries.length < trackIndex) {
                    throw new Error("Filter does not reference a valid producer")
                }
                const track = entries[trackIndex].element
                filters.push({filter, track, timestamp})
            } else if (element.name === "transition") {
                const {transition, a_track: a_trackIndex, b_track: b_trackIndex, timestamp} = this.constructTransition(element)
                if(entries.length < a_trackIndex || entries.length < b_trackIndex) {
                    throw new Error("Transition does not reference a valid producer")
                }
                const a_track = entries[a_trackIndex].element
                const b_track = entries[b_trackIndex].element
                transitions.push({transition, a_track, b_track, timestamp})
            }
        }
        const tractor = new MLT.Tractor(entries, filters, transitions, timestamp)
        if(id) {
            tractor.node.id = id
            this.idTable.tractors[id]= tractor
        }
        return {tractor, timestamp}
    }
    constructMultitrack(node: FinishedElement<"multitrack">) {
        const entries: MLT.Tractor.Track[] = []
        for(const track of node.children) {
            switch (track.name) {
                case "track": {
                    const {producer, ...timestamp} = track.attributes
                    entries.push({element: this.getProducersById(producer), timestamp})
                    break;
                } case "producer": {
                    const {producer, timestamp} = this.constructProducer(track)
                    entries.push({element: producer, timestamp})
                    break;
                } case "playlist": {
                    const {playlist, timestamp} = this.constructPlaylist(track)
                    entries.push({element: playlist, timestamp})
                    break;
                } case "tractor": {
                    const {tractor, timestamp} = this.constructTractor(track)
                    entries.push({element: tractor, timestamp})
                    break;
                }
            }
        }
        return entries
    }
    constructPlaylist(node: FinishedElement<"playlist">) {
        const {id = undefined, ...timestamp} = node.attributes
        const entries: MLT.Playlist.Entry[] = []
        for(const entry of node.children) {
            switch (entry.name) {
                case "blank": {
                    entries.push({element: new MLT.Playlist.Blank(entry.attributes.length)})
                    break;
                } case "entry": {
                    const {producer, ...timestamp} = entry.attributes
                    entries.push({element: this.getProducersById(producer), timestamp})
                    break;
                } case "producer": {
                    const {producer, timestamp} = this.constructProducer(entry)
                    entries.push({element: producer, timestamp})
                    break;
                } case "playlist": {
                    const {playlist, timestamp} = this.constructPlaylist(entry)
                    entries.push({element: playlist, timestamp})
                    break;
                } case "tractor": {
                    const {tractor, timestamp} = this.constructTractor(entry)
                    entries.push({element: tractor, timestamp})
                    break;
                }
            }
        }
        const playlist = new Playlist(entries)
        if(id) {
            playlist.node.id = id
            this.idTable.playlist[id] = playlist
        }
        return {playlist, timestamp}
    }
    constructProducer(node: FinishedElement<"producer">) {
        const properties = Object.fromEntries(node.children.map(({attributes: {name, value}}) => [name, value]))
        const {id = undefined, mlt_service, ...timestamp} = node.attributes
        const producer =  new MLT.Producer(mlt_service as MLT.Producer.Services, properties, timestamp)
        if(id) {
            producer.node.id = id
            this.idTable.producer[id] = producer
        }
        return {producer, timestamp}
    }
    constructConsumer(node: FinishedElement<"consumer">) {
        const properties = Object.fromEntries(node.children.map(({attributes: {name, value}}) => [name, value]))
        const {id = undefined, mlt_service, ...timestamp} = node.attributes
        const consumer = new MLT.Consumer(mlt_service as MLT.Consumer.Services, properties, timestamp)
        if(id) {
            consumer.node.id = id
            this.idTable.consumer[id] = consumer
        }
        return {consumer, timestamp}
    }
    constructTransition(node: FinishedElement<"transition">) {
        const properties = Object.fromEntries(node.children.map(({attributes: {name, value}}) => [name, value]))
        const {id = undefined, mlt_service, a_track, b_track, ...timestamp} = node.attributes
        if(id && id in this.idTable.transition) {
            return {transition: this.idTable.transition[id], a_track, b_track, timestamp: timestamp}
        }
        const transition = new MLT.Transition(mlt_service as MLT.Transition.Services, properties, timestamp)
        if(id) {
            transition.node.id = id
            this.idTable.transition[id] = transition
        }
        return {transition, a_track, b_track, timestamp}
    }
    constructFilter(node: FinishedElement<"filter">) {
        const properties = Object.fromEntries(node.children.map(({attributes: {name, value}}) => [name, value]))
        const {id = undefined, mlt_service, track, ...timestamp} = node.attributes
        if(id && id in this.idTable.filter) {
            return {filter: this.idTable.filter[id], track, timestamp: timestamp}
        }
        const filter = new MLT.Filter(mlt_service as MLT.Filter.Services, properties, timestamp)
        if(id) {
            filter.node.id = id
            this.idTable.filter[id] = filter
        }
        console.log({filter, track, timestamp})
        return {filter, track, timestamp}
    }
}