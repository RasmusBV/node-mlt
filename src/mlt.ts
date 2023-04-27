import { createWriteStream } from 'fs'
import { mkdtemp, rm } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { spawn } from 'child_process'

import { Document, XMLIndenter } from './document'

export async function createXMLDocument(document: Document): Promise<{path: string, remove: () => Promise<void>}>
export async function createXMLDocument(document: Document, path: string): Promise<{path: string}>
export async function createXMLDocument(document: Document, path?: string) {
    //Create writeStream to specified path or temp file
    let returnVariable: {path: string, remove?: () => Promise<void>} = {path: ""}
    
    if(path) {
        returnVariable.path = path
    } else {
        const tmp = await mkdtemp(join(tmpdir(), "melt-"))
        returnVariable.path = join(tmp, "temp.mlt")
        returnVariable.remove = () => rm(tmp, {recursive: true})
    }
    const stream = createWriteStream(returnVariable.path, {flags: "a"})
    
    //Write to stream
    const xml = XMLIndenter(document.generateXML())
    return new Promise((resolve: (value: {path: string, remove?: () => Promise<void>}) => void, reject) => {
        stream.on("ready", () => {
            let value = xml.next()
            while(!value.done) {
                const line = value.value
                stream.write(line)
                value = xml.next()
            }
            stream.write("", () => {
                stream.close(() => {
                    resolve(returnVariable)
                })
            })
        })
        stream.on("error", (e) => reject(e))
    })
}

export async function melt(document: Document, progress?: (percentage: number) => void) {
    const {path, remove} = await createXMLDocument(document)
    console.log(path)
    const ls = spawn("melt", [path])

    if(progress) {
        ls.stderr.on('data', chunk => {
            const chunkAsString = `${chunk}`
            const stringLocation = chunkAsString.indexOf("percentage:")
            if(stringLocation === -1) {return}
            progress(parseInt(chunkAsString.slice(stringLocation).split(":")[1]))
        })
        ls.on('close', (code) => {
            if(code) {progress(100)}
            remove()
        })
    }
    return ls
}