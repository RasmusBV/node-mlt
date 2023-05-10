import { Playlist, Document } from "../../external";

const playlist1 = new Playlist([])
playlist1.node.id = "playlist_1"

const playlist2 = new Playlist([
    {element: playlist1}
])
playlist2.node.id = "playlist_2"

const playlist3 = new Playlist([
    {element: playlist2}
])
playlist3.node.id = "playlist_3"

const playlist4 = new Playlist([
    {element: playlist3}
])
playlist4.node.id = "playlist_4"

playlist1.addTrack(playlist4)
test("Circular Reference", async () => {
    const document = new Document({root: playlist1})
    
    const iterationsToFindCircularReference = 3

    const copy = (Document as any).handleNode;
    (Document as any).handleNode = (parentLink: any, map: any, i: number) => {
        
        if(i > iterationsToFindCircularReference) {throw new Error("Test failed")}
        return copy(parentLink, map, i)
    }
    
    expect(() => {
        document.generateDocumentString()
    }).toThrow("Circular Reference")
})