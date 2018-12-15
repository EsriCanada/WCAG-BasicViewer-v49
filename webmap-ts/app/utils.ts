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

const HexToObj = (col: string): {r: number, g:number, b:number} => {
    // let usePound = false;
    if (col[0] == "#") {
        col = col.slice(1);
        // usePound = true;
    }

    const num = parseInt(col,16);

    let r = (num >> 16);
    if (r > 255) r = 255;
    else if  (r < 0) r = 0;

    let b = ((num >> 8) & 0x00FF);
    if (b > 255) b = 255;
    else if  (b < 0) b = 0;

    let g = (num & 0x0000FF);
    if (g > 255) g = 255;
    else if (g < 0) g = 0;

    return {r:r, g:g, b:b};
}

//rgbA and rgbB are arrays, amountToMix ranges from 0.0 to 1.0
//example (red): rgbA = [255,0,0]
export function MixColors(colA: string, colB: string, amountToMix:number = 0.5) : string {
    const colorChannelMixer = (colorChannelA: number, colorChannelB: number, amountToMix: number): number => {
        const channelA = colorChannelA * amountToMix;
        const channelB = colorChannelB * (1-amountToMix);
        return channelA + channelB;
    }
    
    const rgbA = HexToObj(colA);
    const rgbB = HexToObj(colB);
    const r = colorChannelMixer(rgbA.r, rgbB.r ,amountToMix);
    const g = colorChannelMixer(rgbA.g, rgbB.g ,amountToMix);
    const b = colorChannelMixer(rgbA.b, rgbB.b, amountToMix);
    return "#" + (g | (b << 8) | (r << 16)).toString(16);
    //`rgb(${r}, ${g}, ${b})`;
}

export function isDark(col: string): boolean {
    // YIQ equation from http://24ways.org/2010/calculating-color-contrast
    const rgb = HexToObj(col);
    const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return yiq < 128;
}

export function isLight(col: string): boolean{
    return !isDark(col);
}

export function negate(col: string): string {
    const rgb = HexToObj(col);
    rgb.r = 255 - rgb.r;
    rgb.g = 255 - rgb.g;
    rgb.b = 255 - rgb.b;
    return "#" + (rgb.g | (rgb.b << 8) | (rgb.r << 16)).toString(16);
}


