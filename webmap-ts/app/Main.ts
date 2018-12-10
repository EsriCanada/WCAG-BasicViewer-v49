/*
  Copyright 2017 Esri
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.​
*/

import ApplicationBase = require("ApplicationBase/ApplicationBase");

import i18n = require("dojo/i18n!./widgets/nls/resources");

import BorderContainer = require("dijit/layout/BorderContainer");
import ContentPane = require("dojox/layout/ContentPane");
import lang = require("dojo/_base/lang");
import Deferred = require("dojo/Deferred");



import registry = require("dijit/registry");
import dom = require("dojo/dom");
import domConstruct = require("dojo/dom-construct");

import Search = require("esri/widgets/Search");


import { LightenDarkenColor, Has } from "./utils";

const CSS = {
  loading: "configurable-application--loading"
};

import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  getItemTitle,
  findQuery,
  goToMarker
} from "ApplicationBase/support/itemUtils";

import {
  setPageLocale,
  setPageDirection,
  setPageTitle
} from "ApplicationBase/support/domHelper";

import {
  ApplicationConfig,
  ApplicationBaseSettings
} from "ApplicationBase/interfaces";

class MapExample {
  base: ApplicationBase = null;

  config: ApplicationConfig;

  public init(base: ApplicationBase): void {
    // console.log("init");
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }
    console.log("Config", base.config);
    this.base = base;

    const { config, results, settings } = base;
    const { find, marker } = config;
    const { webMapItems } = results;

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });

    const firstItem = validWebMapItems[0];

    if (!firstItem) {
      console.error("Could not load an item to display");
      return;
    }

    this.config = config;

    this.createUI();

    const portalItem: __esri.PortalItem = this.base.results.applicationItem
      .value;
    const appProxies =
      portalItem && portalItem.applicationProxies
        ? portalItem.applicationProxies
        : null;

    const viewContainerNode = document.getElementById("viewContainer");
    const defaultViewProperties = getConfigViewProperties(config);

    validWebMapItems.forEach(item => {
      const viewNode = document.createElement("div");
      viewContainerNode.appendChild(viewNode);

      const container = {
        container: viewNode
      };

      const viewProperties = {
        ...defaultViewProperties, 
        ...container
      };
      // console.log("viewProperties", viewProperties);

      
      createMapFromItem({ item, appProxies }).then(map => {
        createView({
          ...viewProperties,
          map,
          constraints: {
            rotationEnabled: false
          }
        }).then(mapView => {
          findQuery(find, mapView).then(() => goToMarker(marker, mapView));

          if(this.config.scalebar) {
            require(["esri/widgets/ScaleBar"], (ScaleBar) => {
              var scaleBar = new ScaleBar({
                view: mapView,
                unit: this.config.scaleUnits,
                style: "ruler"
              });
              // Add widget to the bottom left corner of the view
              (mapView as __esri.MapView).ui.add(scaleBar, "bottom-right");
            })
          }

          if(Has(this.config, 'home')) {
            require(["esri/widgets/Home"], (Home) => {
              var homeBtn = new Home({
                view: mapView
              });
        
              // Add the home button to the top left corner of the view
              mapView.ui.add(homeBtn, "top-left");
            });
          }

          if(Has(this.config, 'locate')) {
            require(["esri/widgets/Locate"], (Locate) => {
              var locateBtn = new Locate({
                view: mapView
              });
        
              // Add the home button to the top left corner of the view
              mapView.ui.add(locateBtn, "top-left");
            });
          }
          this.addSearch(this.config, mapView);
          this.createTools(this.config, mapView);

        })
      });
    });

    document.body.classList.remove(CSS.loading);
  }

  private colors = () : void => {
    const configurableStyles = domConstruct.create("style", {
        id: "configurableStyles"
        }, document.head);

        const focusColor = this.config.focusColor;
        const hoverColor = this.config.hoverColor;
        const activeColor = this.config.activeColor;
        const bgColor = this.config.theme;
        const bgLightenColor = LightenDarkenColor(this.config.theme, 50);

        const borderActiveColor = LightenDarkenColor(this.config.activeColor, 75);

        configurableStyles.innerHTML = `
.bg { background: ${bgColor}; }
.fc { color: ${this.config.color}; }
:focus { outline-color: ${focusColor}; }
.claro .dijitSplitterV,
.claro .dijitSplitterH
{
  background: white;
  border-color: ${bgColor};
}
.esri-widget--button {
  background: ${bgColor};
  color: ${this.config.color};
  margin: 1px !important;
}
.esri-widget--button:hover {
  background: ${hoverColor};
  color: ${this.config.color};
}
.headerButton .dijitButtonText {
  color: ${this.config.color};
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
  color: ${this.config.color};
}

.header__numberInput {
  background: ${bgLightenColor};
  color: ${this.config.color};
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
  color: ${this.config.color};
}

.esri-basemap-gallery__item:hover,
.esri-basemap-gallery__item:focus
{
  /* outline: none; */
  background-color: ${hoverColor};
  border-left-color: ${this.config.color};
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
  color: ${this.config.color};
  background: ${bgColor};
}

.esri-button {
  background-color: ${bgColor};
  border: 1px solid ${bgColor};
  color: ${this.config.color};
  border-radius: 5px;
}

.esri-button:hover {
  background-color:  ${hoverColor};
  color: ${this.config.color};
}

.esri-bookmarks__bookmark:hover {
  background-color: ${hoverColor};
  color: ${this.config.color};
}
`;
  }

  private logo = () : void => {
    if (this.config.logo) {
      let altText = (this.config.logoAltText && this.config.logoAltText !== "") ? this.config.logoAltText : "Logo";
      if (!altText || altText === "") { altText = this.config.title; }
      const panelLogo = domConstruct.create(
          "div",
          {
              id: "panelLogo",
              // TabIndex: 0,
              innerHTML:
                  `<img id="logo" src="${this.config.logo}" alt="${altText}" aria-label="${altText}">`
          },
          dom.byId("panelTitle")
      ); //, "first");
      //domClass.add("panelTop", "largerTitle");
      domConstruct.place(
          panelLogo,
          dom.byId("panelText"),
          "before"
      );
    }
  }

  private addSearch = (config: ApplicationConfig, mapView: __esri.MapView | __esri.SceneView) => {
    require(["./widgets/MySearch/MySearch"], lang.hitch(this, function(MySearch) {
      new MySearch({config: this.config, mapView: mapView, container:"panelSearch"});
    }));
  }

  private createTools = (config: ApplicationConfig, mapView: __esri.MapView |__esri.SceneView) => {
    // console.log("createTools");
    require([
      "./widgets/toolbar/toolbar"
    ], function(
      Toolbar
    ) {
      new Toolbar({ config: config, mapView: mapView, container: "panelTools" });
    });
  }

  private languageMenu = (config: ApplicationConfig) : void => {
    require([
      "./widgets/languages/languages"
    ], function(
      Languages
    ) {
      new Languages({ config: config, container: "languageSelectNode" });
    });
  }

  private contactUs = (config: ApplicationConfig) : void => {
    require([
      "./widgets/contactUs/contactUs"
    ], function(
      ContactUs
    ) {
      new ContactUs({ config: config, container: "contactUsNode" });
    });  
  }

  private createUI = () : void => {
    this.logo();
    setPageTitle(this.config.title);
    document.getElementById("panelText").innerHTML = this.config.title;

    this.colors();

    const borderContainer = new BorderContainer({
      gutters: false,
      liveSplitters: true,
      id: "borderContainer"
    });

    const contentPaneTop = new ContentPane({
      region: "top",
      splitter: false,
      style: "padding:0;",
      content: document.getElementById("panelTitle")
    });
    borderContainer.addChild(contentPaneTop);

    const contentPaneLeft = new ContentPane({
      region: "leading",
      splitter: "true",
      style: "width:425px; padding:0; overflow: none;",
      content: document.getElementById("leftPanel"),
      class: "splitterContent"
    });
    borderContainer.addChild(contentPaneLeft);

    const contentPaneRight = new ContentPane({
      style: "padding:1px; background-color:white;",
      region: "center",
      splitter: "true",
      // class: "bg",
      content: document.getElementById("mapPlace")
    });

    borderContainer.addChild(contentPaneRight);
    borderContainer.placeAt(document.body);
    borderContainer.startup();

    this.contactUs(this.config);
    this.languageMenu(this.config);
    // this.createTools(this.config, this.tools);
  };
}

export = MapExample;
