import { randomBytes } from 'crypto'
import { Playlist } from './nodes/playlist.js'
import { Producer } from './nodes/services/producer.js'
import { Tractor } from './nodes/tractor.js'


export type Track = Playlist | Producer | Tractor

export type Node<R extends string, T extends Record<string ,any>> = {
    name: R
    getXML: (context: T & {
        linkName?: string | undefined;
    }) => NodeBuilder.XMLString
}

export type ParentNode<R extends string, T extends Record<string ,any>, C extends Node<any, any>> = {
    children: Children<C>[]
} & Node<R, T>

export type LinkableNode<R extends string, T extends Record<string ,any>, C extends Node<any, any>> = {
    id: string
} & ParentNode<R, T, C>

type Nodes<R extends string, T extends Record<string ,any>, C extends Node<any, any>> = Node<R, T> | ParentNode<R, T, C> | LinkableNode<R, T, C>

export type Child<R extends string, T extends Record<string ,any>> = {node: Node<R, T>, context: T}

export type Children<T extends Node<any, any>> = T extends Node<infer K, infer S> ? {node: Nodes<K, S, any>, context: S} : never

export type Property = Node<"property", {}>

export function Property(name: string, value: string | number): Node<"property", {}> {
    return {
        name: "property",
        getXML: () => {
            return [NodeBuilder.getProperty(name, value)]
        }
    }
}

export type Timestamp = {in?: number, out?: number}

export class NodeBuilder<R extends string, T extends Record<string ,any>, C extends Node<any, any>> {
    name: R
    children: Children<C>[] = []
    timestamp: Timestamp = {}
    linkName: string | undefined
    constructor(name: R, linkName?: string) {
        this.name = name
        this.linkName = linkName
    }
    addChild(child: Children<C>) {
        this.children.push(child)
    }
    addTimestamp(timestamp: Timestamp) {
        this.timestamp = timestamp
    }
    indexOf(track: C) {
        for(let i = 0; i < this.children.length; i++) {
            const child = this.children[i].node
            if(track === child) {return i}
        }
        throw new Error('Track not part of this node')
    }
    build(callback: (context: T & {linkName?: string | undefined}) => {children?: Children<C>[], timestamp?: Timestamp}): ParentNode<R, T, C>
    build(callback: (context: T & {linkName?: string | undefined}) => {children?: Children<C>[], timestamp?: Timestamp}, linkable: true): LinkableNode<R, T, C>
    build(callback: (context: T & {linkName?: string | undefined}) => {children?: Children<C>[], timestamp?: Timestamp}, linkable = false) {
        const obj = {
            name: this.name,
            children: this.children
        }
        const id = linkable ? this.name + "_" + randomBytes(4).toString('hex') : undefined
        let linked = false
        
        const obj2 = {
            ...obj,
            getXML: (context: T & {linkName?: string | undefined}) => {
                const {children = [], timestamp = {}} = callback(context)
                
                if(linked && id) {
                    const {linkName = undefined} = context 
                    return this.link(id, NodeBuilder.assertTimestamp(timestamp), linkName)
                }
                linked = true
                const assertedTimestamp = NodeBuilder.assertTimestamp(timestamp, this.timestamp)
                const [open, close] = id ? 
                    NodeBuilder.getElementTags(this.name, {id, ...assertedTimestamp}) : 
                    NodeBuilder.getElementTags(this.name, assertedTimestamp)

                return [open, [...this.children, ...children].map(({node, context}) => node.getXML({linkName: this.linkName, ...context})).flat(), close]
            }
        }
        if(id) {
            return {
                ...obj2,
                id
            }
        }
        return obj2
    }
    private link(id: string, timestamp: Timestamp, linkName?: string): NodeBuilder.XMLString {
        if(!linkName) {throw new Error(`Cannot link, no linkName provided`)}
        return NodeBuilder.getElementTags(linkName, {producer: id, ...timestamp}, true)
    }
}


export namespace NodeBuilder {
    export type XMLString = (string | XMLString)[]
    export function getAttributeTags(attributes: Record<string, string | number>) {
        return " " + Object.entries(attributes).map(([key, value]) => `${key}="${value}"`).join(" ")
    }
    export function getElementTags(name: string, attributes: Record<string, string | number>, selfClosing?: false): [string, string]
    export function getElementTags(name: string, attributes: Record<string, string | number>, selfClosing: true): [string]
    export function getElementTags(name: string, attributes: Record<string, string | number>, selfClosing = false) {
        if(selfClosing) {
            return [`<${name} ${getAttributeTags(attributes)}/>`] as [string]
        } else {
            return [`<${name}${getAttributeTags(attributes)}>`, `</${name}>`] as [string, string]
        }
    }

    export function getProperty(name: string, value: string | number) {
        const [open, close] = getElementTags("property", {name})
        return open + value + close
    }

    export function assertTimestamp(timestamp: Timestamp, alternate: Timestamp = {}) {
        if("in" in timestamp || "out" in timestamp) {return timestamp}
        return alternate
    }
}