import { Playlist } from './nodes/playlist.js';
import { Producer } from './nodes/services/producer.js';
import { Tractor } from './nodes/tractor.js';
export type Track = Playlist | Producer | Tractor;
export type Node<R extends string, T extends Record<string, any>> = {
    name: R;
    getXML: (context: T & {
        linkName?: string | undefined;
    }) => NodeBuilder.XMLString;
};
export type ParentNode<R extends string, T extends Record<string, any>, C extends Node<any, any>> = {
    children: Children<C>[];
} & Node<R, T>;
export type LinkableNode<R extends string, T extends Record<string, any>, C extends Node<any, any>> = {
    id: string;
} & ParentNode<R, T, C>;
type Nodes<R extends string, T extends Record<string, any>, C extends Node<any, any>> = Node<R, T> | ParentNode<R, T, C> | LinkableNode<R, T, C>;
export type Child<R extends string, T extends Record<string, any>> = {
    node: Node<R, T>;
    context: T;
};
export type Children<T extends Node<any, any>> = T extends Node<infer K, infer S> ? {
    node: Nodes<K, S, any>;
    context: S;
} : never;
export type Property = Node<"property", {}>;
export declare function Property(name: string, value: string | number): Node<"property", {}>;
export type Timestamp = {
    in?: number;
    out?: number;
};
export declare class NodeBuilder<R extends string, T extends Record<string, any>, C extends Node<any, any>> {
    name: R;
    children: Children<C>[];
    timestamp: Timestamp;
    linkName: string | undefined;
    constructor(name: R, linkName?: string);
    addChild(child: Children<C>): void;
    addTimestamp(timestamp: Timestamp): void;
    indexOf(track: C): number;
    build(callback: (context: T & {
        linkName?: string | undefined;
    }) => {
        children?: Children<C>[];
        timestamp?: Timestamp;
    }): ParentNode<R, T, C>;
    build(callback: (context: T & {
        linkName?: string | undefined;
    }) => {
        children?: Children<C>[];
        timestamp?: Timestamp;
    }, linkable: true): LinkableNode<R, T, C>;
    private link;
}
export declare namespace NodeBuilder {
    type XMLString = (string | XMLString)[];
    function getAttributeTags(attributes: Record<string, string | number>): string;
    function getElementTags(name: string, attributes: Record<string, string | number>, selfClosing?: false): [string, string];
    function getElementTags(name: string, attributes: Record<string, string | number>, selfClosing: true): [string];
    function getProperty(name: string, value: string | number): string;
    function assertTimestamp(timestamp: Timestamp, alternate?: Timestamp): Timestamp;
}
export {};
//# sourceMappingURL=mlt.d.ts.map