import { Producer, Playlist, Filter, Document, Consumer } from "../../external";
import { join } from 'path'
import { DocumentTester } from "../helper";

const documentTester = new DocumentTester()

const producer1 = Producer.Image("test")
producer1.node.id = "producer_1"

const producer2 = Producer.Image("test", {in: 0, out: 200})
producer2.node.id = "producer_2"

const root = new Playlist([
    {element: producer1, timestamp: {in: 0, out: 500}},
    {element: producer2, timestamp: {in: 110, out: 300}}
])
root.node.id = "playlist_1"

const filters = [new Filter("lumakey", {})]

filters[0].node.id = "filter_1"

const consumer = new Consumer("avformat", {}, {in: 0, out: 200})

consumer.node.id = "consumer_1"

const profile = {
    test1: "test1",
    test2: 2
}

test("Document Ordering Test", async () => {
    const document = new Document({profile, filters, root, consumer})
    const resultPath = join(__dirname, "document.result.mlt")
    const [testFile, resultFile] = await documentTester.compareDocument(document, resultPath)
    expect(testFile).toEqual(resultFile)
})

afterAll(() => {
    return documentTester.cleanDocuments()
})