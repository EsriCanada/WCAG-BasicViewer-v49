import domConstruct = require("dojo/dom-construct");
import {ApplicationConfig} from "ApplicationBase/interfaces";

// https://www.npmjs.com/package/color

export function CustomColors(config: ApplicationConfig) : void {
    // console.log("CustomColors", document);
    const configurableStyles = domConstruct.create("style", {
        id: "configurableStyles"
        }, document.head);

        const { focusColor, hoverColor, activeColor, theme, color } = config;
        
        const bgColor = theme;
        const fcColor = color;
        // console.log("bgColor", bgColor, HexToRGB(bgColor));
        const bgLightenColor = LightenDarkenColor(bgColor, 50);
        console.log("bgLightenColor", bgColor, "-> ", bgLightenColor)
        const borderActiveColor = LightenDarkenColor(activeColor, isDark(activeColor) ? 75: -75);
        const backgroundActiveHoverColor = MixColors(activeColor, hoverColor, 0.33);

        configurableStyles.innerHTML = `
.bg { background: ${bgColor}; }
.fc { color: ${fcColor}; }
:focus { outline-color: ${focusColor}; }
.claro .dijitSplitterV,
.claro .dijitSplitterH
{
  background: white;
  border-color: ${bgColor};
}
.esri-widget--button {
  background: ${bgColor};
  color: ${fcColor};
  margin: 1px !important;
}
.esri-widget--button:hover {
  background: ${hoverColor};
  color: ${fcColor};
}
.headerButton .dijitButtonText {
  color: ${fcColor};
}
.panelTool.active input[type="image"] {
  background-color: ${activeColor};
  outline-color: ${borderActiveColor};
}
.panelTool input[type="image"]:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}
.panelTool.active input[type="image"]:hover {
  background-color: ${backgroundActiveHoverColor};
}

.header__numberInput {
  background: ${bgLightenColor};
  color: ${WhiteOrBlack(bgLightenColor)};
}

.esri-menu li:hover,
.toc-panel__listItem:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}

.esri-basemap-gallery__item--selected {
  border-left-color: ${borderActiveColor};
  background-color: ${activeColor};
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:hover {
  border-left-color: ${borderActiveColor};
  background-color: ${backgroundActiveHoverColor};
}

.esri-basemap-gallery__item--selected .esri-basemap-gallery__item-title, 
.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus .esri-basemap-gallery__item-title {
  color: ${isDark(activeColor) ? "white": "black"} !important;
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:hover .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(backgroundActiveHoverColor)} !important;
}
.esri-basemap-gallery__item:hover .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(hoverColor)} !important;
}

.esri-basemap-gallery__item:hover
{
  background-color: ${hoverColor};
  border-left-color: ${LightenDarkenColor(hoverColor, isDark(hoverColor) ? 75: -75)};
  color: ${WhiteOrBlack(hoverColor)};
} 

.esri-basemap-gallery__item:focus {
  outline-width: 2px;
  outline-offset: -1px;
  outline-style: solid;
  outline-color: ${focusColor};
  border-left-color: ${focusColor};
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus {
  outline-width: 2px;
  outline-offset: -1px;
  outline-style: solid;
  outline-color: ${borderActiveColor}; 
}

.esri-basemap-gallery__item:hover:focus .esri-basemap-gallery__item-title{
  color: ${WhiteOrBlack(hoverColor)};
}
.esri-basemap-gallery__item:focus .esri-basemap-gallery__item-title {
  border-left-color: ${focusColor};
  color: "black";
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(backgroundActiveHoverColor)};
}

.esri-legend .esri-widget__heading {
  background: ${bgColor};
  color: ${WhiteOrBlack(bgColor)};
}

.esri-button {
  background-color: ${bgColor};
  border: 1px solid ${bgColor};
  color: ${WhiteOrBlack(bgColor)};
  font-weight: bold;
  border-radius: 5px;
}

.esri-button:hover,
.esri-bookmarks__bookmark:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}

.esri-print__advanced-options-section {
  border: 1px solid ${bgColor};
}

.esri-print__refresh-button {
  border: 1px solid ${bgColor};
  border-left-width: 1px; 
}

.esri-print__swap-button {
  flex: 0 0 32px;
  border: 1px solid ${bgColor};
}

.FilterTab [type=radio]:checked~label {
  background: ${activeColor};
  color: ${isDark(activeColor) ? "white": "black"};
}

.FilterTab [type=radio]:checked~label span:focus{
  outline-color: ${borderActiveColor};
}

.FilterTab [type=radio]~label:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}

.FilterTab [type=radio]:checked~label:hover {
  background-color: ${backgroundActiveHoverColor};
  color: ${WhiteOrBlack(backgroundActiveHoverColor)};
}

.pageBtn:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}
`;
  }


const HexToRGB = (hex: string) : {r: number, g: number, b: number} => {
  let c;
  if(/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)){
      c = hex.substring(1).split('');
      if(c.length== 3){
          c= [c[0], c[0], c[1], c[1], c[2], c[2]];
      }
      c= '0x'+c.join('');
      return {r:(c>>16)&255, g:(c>>8)&255, b:c&255};
  }
  throw new Error('Bad Hex');
}

export function LightenDarkenColor(col: string, amt: number): string {

  let usePound = false;
  if (col[0] == "#") {
      col = col.slice(1);
      usePound = true;
  }
  const num = parseInt(col, 16);

  let r = (num >> 16) + amt;
  if (r > 255) r = 255;
  else if (r < 0) r = 0;
  
  let b = ((num >> 8) & 0x00FF) + amt;
  if (b > 255) b = 255;
  else if (b < 0) b = 0;
  
  let g = (num & 0x0000FF) + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;
  
  return (usePound ? "#" : "") + (g | (b << 8) | (r << 16)).toString(16);
}
// export function LightenDarkenColor(col: string, amt: number): string {
//   // console.log("LightenDarkenColor", col, amt);
//   const usePound = col[0] == "#";
//   const RGB = HexToRGB(col);

//   let r = RGB.r + amt;
//   if (r > 255) r = 255;
//   else if  (r < 0) r = 0;

//   let b = RGB.b + amt;
//   if (b > 255) b = 255;
//   else if  (b < 0) b = 0;

//   let g = RGB.g + amt;
//   if (g > 255) g = 255;
//   else if (g < 0) g = 0;

//   return (usePound?"#":"") + (g | (b << 8) | (r << 16)).toString(16);
// }

export function MixColors(colA: string, colB: string, amountToMix:number = 0.5) : string {
  const colorChannelMixer = (colorChannelA: number, colorChannelB: number, amountToMix: number): number => {
      const channelA = colorChannelA * amountToMix;
      const channelB = colorChannelB * (1-amountToMix);
      return channelA + channelB;
  }
  
  const rgbA = HexToRGB(colA);
  const rgbB = HexToRGB(colB);
  const r = colorChannelMixer(rgbA.r, rgbB.r ,amountToMix);
  const g = colorChannelMixer(rgbA.g, rgbB.g ,amountToMix);
  const b = colorChannelMixer(rgbA.b, rgbB.b, amountToMix);
  return "#" + (g | (b << 8) | (r << 16)).toString(16);
}

export function isDark(col: string): boolean {
  // YIQ equation from http://24ways.org/2010/calculating-color-contrast
  const rgb = HexToRGB(col);
  const yiq = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return yiq < 128;
}

export function isLight(col: string): boolean{
  return !isDark(col);
}

export function Negate(col: string): string {
  const rgb = HexToRGB(col);
  rgb.r = 255 - rgb.r;
  rgb.g = 255 - rgb.g;
  rgb.b = 255 - rgb.b;
  return "#" + (rgb.g | (rgb.b << 8) | (rgb.r << 16)).toString(16);
}

export function WhiteOrBlack(col: string): string {
  return isDark(col) ? "#ffffff": "#000000";
}
