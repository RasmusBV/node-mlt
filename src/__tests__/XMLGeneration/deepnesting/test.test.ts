import { Producer, Playlist, Tractor, Document } from "../../../external";
import { join } from 'path'
import { DocumentTester } from "../../helper";

const documentTester = new DocumentTester()

const root = new Tractor([])
root.node.id = "root"
root.multitrack.node.id = "root"

let currentElement = root
for(let i = 0; i < 20; i++) {
    const element = new Tractor([])
    element.node.id = `tractor_${i}`
    element.multitrack.node.id = `multitrack_${i}`
    let playlist = new Playlist([{element, timestamp: {in: i*20, out: (i+1)*20}}])
    playlist.node.id = `playlist_${i}`
    currentElement.addTrack(playlist)
    const producer = new Producer("avformat")
    producer.node.id = `producer_${i}`
    currentElement.addTrack(producer)
    currentElement = element
}

test("Deep Nesting", async () => {
    const document = new Document({root})
    const [testFile, resultFile] = await documentTester.runXMLGenerationTest(document, __dirname)
    expect(testFile).toEqual(resultFile)
})

afterAll(() => {
    return documentTester.cleanDocuments()
})