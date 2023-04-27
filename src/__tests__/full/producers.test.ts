import { Producer, Playlist, Tractor, Filter, Transition, Document } from "../../external";
import { join } from 'path'
import { DocumentTester } from "../helper";

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
    {element: producer3}
])
playlist2.node.id = "playlist_2"

const transition1 = new Transition("composite", {})
transition1.node.id = "transition_1"

const filter1 = new Filter("invert", {})
filter1.node.id = "filter_1"

const tractor1 = new Tractor([
    {element: playlist1},
    {element: playlist2, timestamp: {in: 200, out: 500}}
], [
    {filter: filter1, track: playlist1}
])
tractor1.node.id = "tractor_1"
tractor1.multitrack.node.id = "multitrack_1"

const tractor2 = new Tractor([
    {element: playlist2},
    {element: tractor1},
    {element: producer1, timestamp: {in: 500, out: 1000}}
], [
    {transition: transition1, a_track: playlist2, b_track: tractor1, timestamp: {in: 200, out: 300}}
])
tractor2.node.id = "tractor_2"
tractor2.multitrack.node.id = "multitrack_2"

const playlist3 = new Playlist([
    {element: tractor1, timestamp: {in: 0, out: 2000}},
    {element: producer3}
])
playlist3.node.id = "playlist_3"

const tractor3 = new Tractor([
    {element: playlist3},
    {element: tractor2, timestamp: {in: 100, out: 500}}
], [
    {filter: filter1, track: playlist3, timestamp: {in: 300, out: 400}}
], [
    {transition: transition1, a_track: playlist3, b_track: tractor2}
])
tractor3.node.id = "tractor_3"
tractor3.multitrack.node.id = "multitrack_3"

test("All Producers Linking Test", async () => {
    const document = new Document({root: tractor3})
    const resultPath = join(__dirname, "producers.result.mlt")
    const [testFile, resultFile] = await DocumentTester.compareDocument(document, resultPath)
    expect(testFile).toEqual(resultFile)
})