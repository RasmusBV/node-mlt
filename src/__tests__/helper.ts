import { LinkableParentNode, ParentNode, XMLString } from "../nodes";
import MLT from '../index'
import { readFile } from "fs/promises";
import { join } from "path";

export function getId(element: {node: LinkableParentNode | ParentNode}) {
    return element.node.id
}

export namespace SimpleElements {
    export function getTags(element: {node: LinkableParentNode | ParentNode}): [string, string]
    export function getTags(element: {node: LinkableParentNode | ParentNode}, children: XMLString): [string, XMLString, string]
    export function getTags(element: {node: LinkableParentNode | ParentNode}, children?: XMLString) {
        const [open, close] = [`<${element.node.name} id="${getId(element)}">`,`</${element.node.name}>`]
        if(children) {
            return [open, children, close]
        } else {
            return [open, close]
        }
    }
    export function Producer() {
        const producer = new MLT.Producer("avformat", {})
        const XML = getTags(producer, ['<property name="mlt_service">avformat</property>']) as [string, [string], string]
        return {producer, XML}
    }
}

export class DocumentTester {
    private documentPaths: (() => Promise<void>)[] = []
    async generateDocument(document: MLT.Document) {
        const {path, remove} = await document.saveAsXMLDocument()
        this.documentPaths.push(remove)
        return path
    }
    async compareDocument(document: MLT.Document, resultPath: string) {
        const testPath = await this.generateDocument(document)
        const testFile = await readFile(testPath, {encoding: "utf-8"})
        const resultFile = await readFile(resultPath, {encoding: "utf-8"})
        return [testFile, resultFile] as [string, string]
    }
    async cleanDocuments() {
        while(this.documentPaths.length) {
            const remove = this.documentPaths.shift()!
            remove()
        }
    }
    async runXMLGenerationTest(document: MLT.Document, dirname: string, index?: number) {
        const resultPath = index ? join(dirname, `result${index}.xml`) : join(dirname, "result.xml")
        return await this.compareDocument(document, resultPath)
    }
}
