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

import BorderContainer = require("dijit/layout/BorderContainer");
import ContentPane = require("dojox/layout/ContentPane");
import lang = require("dojo/_base/lang");
import on = require("dojo/on");

import Deferred = require("dojo/Deferred");
import Geometry = require("esri/geometry/Geometry");

import dom = require("dojo/dom");
import domConstruct = require("dojo/dom-construct");

import { Has } from "./utils";
import { CustomColors } from "./customColors";
import i18nCommon = require("dojo/i18n!esri/nls/common");

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
    console.log("Commom Strings", i18nCommon);

    // console.log("init");
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }
    // console.log("Base", base);
    console.log("base", base);
    // console.log("Config", base.config);
    this.base = base;

    const { config, results, settings, units } = base;
    const { find, marker } = config;
    const { webMapItems } = results;

    // console.log("units", units);
    
    setPageLocale(config.locale);
    // window["dojoConfig"].locale = config.locale;
    // console.log("dojoConfig", window["dojoConfig"]);
    // setPageDirection(base.direction);

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
          // console.log("mapView", mapView);
          mapView.highlightOptions.color = this.config.focusColor;

          if(find && find .isNullOrWhiteSpace() && marker && !marker.isNullOrWhiteSpace()) {
            findQuery(find, mapView).then(() => goToMarker(marker, mapView));
          }

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

          const homeDiv = domConstruct.create("div", {class:"esri-component esri-zoom esri-widget"});
          mapView.ui.add(homeDiv, "top-left");
          
          if(Has(this.config, 'home')) {
            require(["esri/widgets/Home"], (Home) => {
                var homeBtn = new Home({
                  view: mapView,
                  container: domConstruct.create("div", {}, homeDiv)
                });
        
              // Add the home button to the top left corner of the view
              // mapView.ui.add(homeBtn, "top-left");
            });
          }

          if(Has(this.config, 'locate')) {
            require(["esri/widgets/Locate"], (Locate) => {
              var locateBtn = new Locate({
                view: mapView,
                container: domConstruct.create("div", {}, homeDiv)
              });
        
              // mapView.ui.add(locateBtn, "top-left");
            });
          }

          // setTimeout(() => { mapView.popup.dockEnabled = true; }, 100); // ?

          mapView.popup.collapseEnabled = false;

          mapView.popup.actions.removeAll();
          // const PanAction = {
          //     title: "Pan To",
          //     id: "pan-to-this",
          //     image: "images/PanTo.16.png"
          // };
  
          // mapView.popup.actions.push(PanAction as __esri.ActionButton);
  
          // mapView.popup.on("trigger-action", (event) => {
          //     // Execute the measureThis() function if the measure-this action is clicked
          //     if (event.action.id === "pan-to-this") {
          //         // console.log("pan-to-this", event, event.target.selectedFeature);
          //         const geometry : Geometry = event.target.selectedFeature.geometry;
          //         (mapView as __esri.MapView).goTo(geometry);
          //     }
          //   });

          let lastLocation : any;
          const RemoveLastLocation = () => {
              if(lastLocation) {
                  mapView.graphics.remove(lastLocation);
                  lastLocation = null;
              }
          }
      
      
          mapView.popup.watch("selectedFeature", (feature, oldFeature) => {
              // console.log("selectedFeature", feature, oldFeature);
              RemoveLastLocation();
              if(!feature) return;
              const geometry : Geometry = feature.geometry;
              if(geometry) {
                  const isVisibleAtScale = (layer : any) : boolean => {
                      return (layer.minScale <= 0 || mapView.scale <= layer.minScale) &&
                      (layer.maxScale <= 0 || mapView.scale >= layer.maxScale)
                  } 
                  const MapView = (mapView as __esri.MapView);
                  if(feature.layer) {
                      if(feature.layer.geometryType == "point" && !isVisibleAtScale(feature.layer)) {
                          const options={target:geometry, scale:((feature.layer.maxScale+feature.layer.minScale)/2)};
                          console.log("options", options);
                          MapView.goTo(options);
                      }
                      else {
                        MapView.goTo(geometry);
                      } 
                  } 
                  else {
                      MapView.goTo(geometry);
                      mapView.graphics.add(feature);
                      lastLocation = feature;
                  }
              }

              // console.log("popup content", this.mapView.popup.content, feature);
              // // if(this.mapView.popup.content && (this.mapView.popup.content as any).popupTemplate)
              // // {
              // //     console.log("content", (this.mapView.popup.content as any).popupTemplate.content);
              // // }
          });

          mapView.popup.watch("visible", (visible, oldVisible) => {
              // console.log("popup visible", oldVisible, visible);
              if(!visible) {
                  RemoveLastLocation();
              }
          });

          this.addSearch(this.config, mapView);
          this.createTools(mapView);

        })
      });
    });

    document.body.classList.remove(CSS.loading);
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

  private search = new Deferred();
  private addSearch = (config: ApplicationConfig, mapView: __esri.MapView | __esri.SceneView) => {
    require(["./widgets/MySearch/MySearch"], lang.hitch(this, function(MySearch) {
      const mySearch = new MySearch({config: this.config, mapView: mapView, search:this.search, container:"panelSearch"});
      // console.log("MySearch", mySearch, mySearch.search);
      this.search = MySearch.search;
    }));
  }

  private createTools = (mapView: __esri.MapView |__esri.SceneView) => {
    // console.log("createTools");
    require([
      "./widgets/toolbar/toolbar"
    ], (Toolbar) => {
      this.search.then(search => 
      new Toolbar({ portal: this.base.portal, config: this.config, mapView: mapView, search: search, container: "panelTools" })
      );
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

    CustomColors(this.config);

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
  };
}

export = MapExample;
