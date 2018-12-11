import domConstruct = require("dojo/dom-construct");
import { LightenDarkenColor } from "./utils";
import {ApplicationConfig} from "ApplicationBase/interfaces";


export function CustomColors(config: ApplicationConfig) : void {
    console.log("CustomColors", document);
    const configurableStyles = domConstruct.create("style", {
        id: "configurableStyles"
        }, document.head);

        const focusColor = config.focusColor;
        const hoverColor = config.hoverColor;
        const activeColor = config.activeColor;
        const bgColor = config.theme;
        const bgLightenColor = LightenDarkenColor(config.theme, 50);

        const borderActiveColor = LightenDarkenColor(config.activeColor, 75);

        configurableStyles.innerHTML = `
.bg { background: ${bgColor}; }
.fc { color: ${config.color}; }
:focus { outline-color: ${focusColor}; }
.claro .dijitSplitterV,
.claro .dijitSplitterH
{
  background: white;
  border-color: ${bgColor};
}
.esri-widget--button {
  background: ${bgColor};
  color: ${config.color};
  margin: 1px !important;
}
.esri-widget--button:hover {
  background: ${hoverColor};
  color: ${config.color};
}
.headerButton .dijitButtonText {
  color: ${config.color};
}
.panelTool.active input[type="image"] {
  background-color: ${activeColor};
  outline-color: ${borderActiveColor};
}
.panelTool input[type="image"]:hover {
  background-color: ${hoverColor};
}
.panelTool.active input[type="image"]:hover {
  background-color: ${borderActiveColor};
}

.esri-menu li:hover {
  background-color: ${hoverColor};
  color: ${config.color};
}

.header__numberInput {
  background: ${bgLightenColor};
  color: ${config.color};
}

.esri-basemap-gallery__item--selected, 
.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:hover, 
.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus {
  border-left-color: ${borderActiveColor};
  background-color: ${activeColor};
}

.esri-basemap-gallery__item--selected .esri-basemap-gallery__item-title, 
.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:hover .esri-basemap-gallery__item-title, 
.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus .esri-basemap-gallery__item-title,
.esri-basemap-gallery__item:hover .esri-basemap-gallery__item-title {
  color: ${config.color};
}

.esri-basemap-gallery__item:hover,
.esri-basemap-gallery__item:focus
{
  /* outline: none; */
  background-color: ${hoverColor};
  border-left-color: ${config.color};
} 

.esri-basemap-gallery__item:focus {
  outline-width: 2px;
  outline-offset: -1px;
  outline-style: solid;
  outline-color: ${focusColor};
  border-left-color: ${focusColor};
  background-color: transparent;
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus {
  outline-width: 2px;
  outline-offset: -1px;
  outline-style: solid;
  outline-color: ${borderActiveColor}; 
}

.esri-basemap-gallery__item:hover:focus .esri-basemap-gallery__item-title,
.esri-basemap-gallery__item:focus  .esri-basemap-gallery__item-title {
  color: black;
}

.esri-basemap-gallery__item.esri-basemap-gallery__item--selected:focus .esri-basemap-gallery__item-title {
  color:white;
}

.esri-legend .esri-widget__heading {
  color: ${config.color};
  background: ${bgColor};
}

.esri-button {
  background-color: ${bgColor};
  border: 1px solid ${bgColor};
  color: ${config.color};
  border-radius: 5px;
}

.esri-button:hover {
  background-color:  ${hoverColor};
  color: ${config.color};
}

.esri-bookmarks__bookmark:hover {
  background-color: ${hoverColor};
  color: ${config.color};
}
`;
  }
