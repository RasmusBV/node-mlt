import { LinkableParentNode, ParentNode, XMLString } from "../../nodes";
import MLT from '../../index'

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