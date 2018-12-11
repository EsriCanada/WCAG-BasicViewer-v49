import { ApplicationConfig } from "ApplicationBase/interfaces";

export function isNullOrWhiteSpace (val:string): boolean {
    return (val === undefined || val === null || val.trim() === '');
}

export function stripTags(val:string): string {
    return val.replace(/<[^>]*>/g, "", );
}

export function LightenDarkenColor(col: string, amt: number): string {
    var usePound = false;
  
    if (col[0] == "#") {
        col = col.slice(1);
        usePound = true;
    }
 
    var num = parseInt(col,16);
 
    var r = (num >> 16) + amt;
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;
 
    var b = ((num >> 8) & 0x00FF) + amt;
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;
 
    var g = (num & 0x0000FF) + amt;
    if (g > 255) g = 255;
    else if (g < 0) g = 0;
 
    return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
}

export function Has(config: ApplicationConfig, tool:string) : boolean {
    // console.log("has", tool, this.config[`tool_${tool}`]);
    const hasTool = config[`tool_${tool}`]
    return hasTool != 'undefined' && hasTool;
}

export function NormalizeTitle(title : string) : string {
    return title.replace("_", " ").replace(/(\1[a-z])(\2[A-Z])/g, "$1 $2").replace(/(\1[A-Z]+)(\2[A-Z])(\3[a-z])/g, "$1 $2$3");
}


