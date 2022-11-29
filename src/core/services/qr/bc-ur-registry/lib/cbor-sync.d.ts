export namespace config {
    const useToJSON: boolean;
}
export function addWriter(format: any, writerFunction: any): void;
export function addReader(format: any, readerFunction: any): void;
export function encode(data: any, format: any): any;
export function encodeDataItem(data: any, format?: any): any;
export function decode(data: any, format: any): any;
export function decodeToDataItem(data: any, format?: any): import("./DataItem").DataItem;
export function addSemanticEncode(tag: any, fn: any): {
    config: {
        useToJSON: boolean;
    };
    addWriter: (format: any, writerFunction: any) => void;
    addReader: (format: any, readerFunction: any) => void;
    encode: (data: any, format: any) => any;
    encodeDataItem: (data: any, format: any) => any;
    decode: (data: any, format: any) => any;
    decodeToDataItem: (data: any, format: any) => import("./DataItem").DataItem;
    addSemanticEncode: (tag: any, fn: any) => any;
    addSemanticDecode: (tag: any, fn: any) => any;
};
export function addSemanticDecode(tag: any, fn: any): {
    config: {
        useToJSON: boolean;
    };
    addWriter: (format: any, writerFunction: any) => void;
    addReader: (format: any, readerFunction: any) => void;
    encode: (data: any, format: any) => any;
    encodeDataItem: (data: any, format: any) => any;
    decode: (data: any, format: any) => any;
    decodeToDataItem: (data: any, format: any) => import("./DataItem").DataItem;
    addSemanticEncode: (tag: any, fn: any) => any;
    addSemanticDecode: (tag: any, fn: any) => any;
};
//# sourceMappingURL=cbor-sync.d.ts.map
