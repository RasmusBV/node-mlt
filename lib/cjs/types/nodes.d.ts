export type XMLString = (string | XMLString)[];
export type Timestamp = {
    in?: number;
    out?: number;
};
export type Context = {
    timestamp?: Timestamp;
    children?: ChildElement[];
};
export type ChildElement = ({
    element: ParentNode<any> | LinkableParentNode<any>;
    context: Context;
} | {
    element: Node<any>;
});
export declare class Node<R extends string> {
    name: R;
    attributes: Record<string, string | number>;
    value: string | number | undefined;
    constructor(name: R, attributes: Record<string, string | number>, value?: string | number);
    getXML(): XMLString;
    private static getAttributeTags;
    static Property(name: string, value: string | number): Node<"property">;
    static mapPropertiesToNodes(properties: Record<string, string | number>): ChildElement[];
}
export declare class ParentNode<R extends string> {
    name: R;
    timestamp: Timestamp;
    children: ChildElement[];
    linkName: string | undefined;
    id: Record<string, string>;
    constructor(name: R, children: ChildElement[], timestamp?: Timestamp, linkName?: string);
    getXML({ timestamp, children }: Context): XMLString;
    static getAttributeTags(attributes: Record<string, string | number>): string;
    static getChildXML(child: ChildElement, linkName: string | undefined): XMLString;
}
export declare class LinkableParentNode<R extends string> extends ParentNode<R> {
    linked: boolean;
    constructor(name: R, children: ChildElement[], timestamp?: Timestamp, linkName?: string);
    getXML({ timestamp, children }: Context, linkName?: string): XMLString;
}
export declare class Service<R extends string> extends ParentNode<R> {
    constructor(name: R, mlt_service: string, properties: Record<string, string | number>, timestamp?: Timestamp);
    addProperty(name: string, value: string | number): this;
}
//# sourceMappingURL=nodes.d.ts.map