/// <reference types="typescript" />

declare interface String {
    isNullOrWhiteSpace() : boolean;
    NormalizeTitle() : string;
    stripTags() : string;
    format() : string;
    mixIn(o:any) : string;
}

declare interface Date {
    toSQL() : string;
}

declare interface Number {
    padLeft(n : number, str? : string)
}
