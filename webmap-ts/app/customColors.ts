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
        // const backgroundActiveFocusColor = MixColors(activeColor, focusColor, 0.33);

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

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus:hover {
  background-color: ${backgroundActiveHoverColor};
}

.esri-basemap-gallery__item--selected .esri-basemap-gallery__item-title,
.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(activeColor)};
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus {
  background-color: ${activeColor};
  border-left-color: ${focusColor};
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus:hover .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(backgroundActiveHoverColor)};
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:hover .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(backgroundActiveHoverColor)};
}
.esri-basemap-gallery__item:hover .esri-basemap-gallery__item-title {
  color: ${WhiteOrBlack(hoverColor)};
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
}

.esri-basemap-gallery__item:hover:focus .esri-basemap-gallery__item-title{
  color: ${WhiteOrBlack(hoverColor)};
}
.esri-basemap-gallery__item:focus .esri-basemap-gallery__item-title {
  border-left-color: ${focusColor};
  color: "black";
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

.FilterTab [type=radio]~label:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}

.pageBtn:hover {
  background-color: ${hoverColor};
  color: ${WhiteOrBlack(hoverColor)};
}

/*
.FilterTab [type=radio]:checked~label span:focus{
  outline-color: ${borderActiveColor};
}

.FilterTab [type=radio]:checked~label {
  background: ${activeColor};
  color: ${WhiteOrBlack(activeColor)};
}

.FilterTab [type=radio]:checked~label:hover {
  background-color: ${backgroundActiveHoverColor};
  color: ${WhiteOrBlack(backgroundActiveHoverColor)};
}
*/

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

const toHex = (n: number, d: number = 2) : string => {
  let s = n.toString(16);
  return `${Array(d-s.length+1).join("0")}${s}`;
}

export function LightenDarkenColor(col: string, amt: number): string {
  const usePound = col[0] == "#";
  const RGB = HexToRGB(col);

  let r = RGB.r + amt;
  if (r > 255) r = 255;
  else if  (r < 0) r = 0;

  let b = RGB.b + amt;
  if (b > 255) b = 255;
  else if  (b < 0) b = 0;

  let g = RGB.g + amt;
  if (g > 255) g = 255;
  else if (g < 0) g = 0;

  return `${(usePound ? "#" : "")}${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

export function MixColors(colA: string, colB: string, amountToMix:number = 0.5) : string {
  const colorChannelMixer = (colorChannelA: number, colorChannelB: number, amountToMix: number): number => {
      const channelA = colorChannelA * amountToMix;
      const channelB = colorChannelB * (1-amountToMix);
      return Math.round(channelA + channelB);
  }
  
  const rgbA = HexToRGB(colA);
  const rgbB = HexToRGB(colB);
  const r = colorChannelMixer(rgbA.r, rgbB.r ,amountToMix);
  const g = colorChannelMixer(rgbA.g, rgbB.g ,amountToMix);
  const b = colorChannelMixer(rgbA.b, rgbB.b, amountToMix);
  console.log("rgn", r, g, b);
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
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
  return `#${toHex(rgb.r)}${toHex(rgb.b)}${toHex(rgb.g)}`;
}

export function WhiteOrBlack(col: string): string {
  return isDark(col) ? "#ffffff": "#000000";
}
