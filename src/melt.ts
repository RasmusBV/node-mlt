import { spawn } from 'child_process'
import { Document } from './document'

export async function melt(document: Document, progress?: (percentage: number) => void) {
    const {path, remove} = await document.saveAsXMLDocument()
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