/// <reference types="typescript" />

declare interface String {
    isNullOrWhiteSpace() : boolean;
    NormalizeTitle() : string;
    stripTags() : string;
    // format() : string;
    format(...replacements: string[]): string;
    mixIn(o:any) : string;
    startsWith(searchString: String, pos?: number) : boolean;
    Format(...args) : string;
}

// interface StringConstructor {
//     format: (formatString: string, ...replacement: any[]) => string;
// }


declare interface Date {
    toSQL() : string;
    toInputDate() : string;
}

declare interface Number {
    padLeft(n : number, str? : string)
}
