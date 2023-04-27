import { Producer, Tractor, Filter, Transition } from "../../external";

const filter = new Filter("affine", {})
filter.node.id = "filter_1"

const transition = new Transition("affine", {})
transition.node.id = "transition_1"

function getProducers(): [{element: Producer}, {element: Producer}, {element: Producer}] {
    const producer1 = Producer.Image("test", {in: 0, out: 300})
    producer1.node.id = "producer_1"

    const producer2 = Producer.Image("test", {in: 0, out: 200})
    producer2.node.id = "producer_2"

    const producer3 = Producer.Video("test", {out: 500})
    producer3.node.id = "producer_3"

    return [{element: producer1}, {element: producer2}, {element: producer3}]
}

describe("Linking Transitions and Filters to Tractors", () => {
    it("Should not throw when trying to link producers which are all present in the multitrack of the tractor", () => {
        const [producer1, producer2] = getProducers()
        const tractor = new Tractor([producer1, producer2])
        tractor.addFilter(filter, producer1.element)
        tractor.addTransition(transition, producer1.element, producer2.element)
        expect(() => tractor.node.getXML()).not.toThrow()
    })

    it("Should throw directly when trying to link a producer which is not present in the multitrack of the tractor", () => {
        const [producer1, producer2, producer3] = getProducers()
        const tractor = new Tractor([producer1, producer2])
        expect(() => {tractor.addFilter(filter, producer3.element)}).toThrow(new Error("Track not part of this Node"))
        expect(() => {tractor.addTransition(transition, producer1.element, producer3.element)}).toThrow(new Error("Track not part of this Node"))
    })

    it("Should throw directly when trying to construct a tractor with links to producers not present in the the constructor", () => {
        const [producer1, producer2, producer3] = getProducers()
        expect(() => {
            new Tractor([producer1, producer2], [
                {filter, track: producer3.element}
            ])
        }).toThrow(new Error("Track not part of this Node"))
        expect(() => {
            new Tractor([producer1, producer2], [
                {transition, a_track: producer1.element, b_track: producer3.element}
            ])
        }).toThrow(new Error("Track not part of this Node"))
    })
})