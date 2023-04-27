import { Playlist } from "../../external";
import { getId, SimpleElements } from "../helper";

const simplePlaylist = new Playlist([])
const simpleXMLResult = [ `<playlist id="${getId(simplePlaylist)}">`, [], '</playlist>' ]

test('Simple Playlist', () => {
    expect(simplePlaylist.node.getXML({})).toEqual(simpleXMLResult)
})

const {producer, XML} = SimpleElements.Producer()
const playlistWithEntry = new Playlist([{element: producer, timestamp: {}}])

const playlistXML = SimpleElements.getTags(playlistWithEntry, XML)

test('Playlist With Entry', () => {
    expect(playlistWithEntry.node.getXML()).toEqual(playlistXML)
})