import { Playlist, Tractor, Producer, Document } from "../../external";

const producer1 = Producer.Image("test")
producer1.node.id = "producer_1"

const producer2 = Producer.Image("test", {in: 0, out: 200})
producer2.node.id = "producer_2"

const producer3 = Producer.Video("test", {out: 500})
producer3.node.id = "producer_3"

const playlist1 = new Playlist([
    {element: producer1, timestamp: {in: 0, out: 500}},
    {element: producer2, timestamp: {in: 110, out: 300}}
])
playlist1.node.id = "playlist_1"

const playlist2 = new Playlist([
    {element: producer1, timestamp: {in: 0, out: 100}},
    {element: new Playlist.Blank(200)},
    {element: producer3},
    {element: playlist1}
])
playlist2.node.id = "playlist_2"

const tractor1 = new Tractor([
    {element: producer3},
    {element: playlist1},
    {element: playlist2}
])

const tractor2 = new Tractor([
    {element: tractor1},
    {element: producer3},
    {element: producer2},
    {element: playlist1}
])

const playlist3 = new Playlist([
    {element: playlist2},
    {element: playlist1},
    {element: tractor1}
])

const playlist4 = new Playlist([
    {element: producer2},
    {element: tractor1},
    {element: playlist3}
])

const tractor3 = new Tractor([
    {element: tractor2},
    {element: playlist4}
])

playlist1.addTrack(tractor3)

test("Circular Reference", async () => {
    const document = new Document({root: playlist1});
    const iterationsToFindCircularReference = 7
    const copy = (Document as any).handleNode;
    (Document as any).handleNode = (parentLink: any, map: any, i: number) => {
        if(i > iterationsToFindCircularReference) {throw new Error("Test failed")}
        return copy(parentLink, map, i)
    }

    expect(() => {
        document.generateDocumentString()
    }).toThrow("Circular Reference")
})