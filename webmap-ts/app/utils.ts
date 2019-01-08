import { ApplicationConfig } from "ApplicationBase/interfaces";

export function stripTags(val:string): string {
    return val.replace(/<[^>]*>/g, "", );
}

export function Has(config: ApplicationConfig, tool:string) : boolean {
    // console.log("has", tool, this.config[`tool_${tool}`]);
    const hasTool = config[`tool_${tool}`]
    return hasTool != 'undefined' && hasTool;
}

String.prototype.NormalizeTitle = function() : string {
    return this.replace("_", " ").replace(/(\1[a-z])(\2[A-Z])/g, "$1 $2").replace(/(\1[A-Z]+)(\2[A-Z])(\3[a-z])/g, "$1 $2$3");
}

String.prototype.isNullOrWhiteSpace = function() : boolean {
    return this === undefined || this === null || this.trim() === '';
};
