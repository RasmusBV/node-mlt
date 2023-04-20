import { createWriteStream } from 'fs'
import { mkdtemp } from 'fs/promises'
import {join} from 'path'
import {tmpdir} from 'os'
import { spawn, ChildProcessWithoutNullStreams, exec } from 'child_process'

import { Document, XMLIndenter } from './document'

export async function createXMLDocument(document: Document, path?: string) {
    //Create writeStream to specified path or temp file
    let filePath: string
    if(path) {
        filePath = path
    } else {
        const tmp = await mkdtemp(join(tmpdir(), "melt-"))
        filePath = join(tmp, "doc.mlt")
    }
    const stream = createWriteStream(filePath, {flags: "a"})
    
    //Write to stream
    const xml = XMLIndenter(document.generateXML())
    return new Promise((resolve: (value: string) => void, reject) => {
        stream.on("ready", () => {
            let value = xml.next()
            while(!value.done) {
                const line = value.value
                stream.write(line)
                value = xml.next()
            }
            stream.write(" ", () => {
                stream.close(() => {
                    resolve(filePath)
                })
            })
        })
        stream.on("error", (e) => reject(e))
    })
}

export async function melt(document: Document, progress?: (percentage: number) => void) {
    const path = await createXMLDocument(document)
    console.log(path)
    const ls = spawn("melt", [path])

    if(progress) {
        ls.stderr.on('data', chunk => {
            const chunkAsString = `${chunk}`
            const stringLocation = chunkAsString.indexOf("percentage:")
            if(stringLocation === -1) {return}
            progress(parseInt(chunkAsString.slice(stringLocation).split(":")[1]))
        })
        ls.on('close', (code) => code ? undefined : progress(100))
    }
    return ls
}