/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
// import * as Promise from 'lib';

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

import {
    createMapFromItem,
    createView,
  } from "ApplicationBase/support/itemUtils";
  

@subclass("esri.widgets.MyOverviewMap")
  class MyOverviewMap extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;

    // @property()
    // config: ApplicationConfig;
  
    @property()
    @renderable()
    scaleFactor: number = 3;
  
    constructor() {
        super();
    }
            
    render() {
        // console.log("render", this.scaleFactor);
        return (
        <div class="overviewDiv">
            <div 
                id="extentDiv" 
                tabindex="0" 
                role="application"
                title="Map Extent"
                afterCreate={this._addOverviewMap}>
                <span class="esri-icon-font-fallback-text">Move Extent Instructions</span>
            </div>
        </div>
        );
    }

    private _addOverviewMap = (element: Element) => {
        require([
            "esri/Map",
            "esri/views/SceneView",
            "esri/views/MapView",
            "esri/core/watchUtils"
        ], lang.hitch(this, function(Map, SceneView, MapView, watchUtils) {
            
            const overviewMap = new Map ({
                basemap: "topo"
            });

            const overviewView: __esri.MapView = new MapView({
                container: domConstruct.create("div", {
                    id: "overviewDiv"
                }, element, "before"),
                map: overviewMap,
                constraints: {
                  rotationEnabled: false
                }
              });

            overviewView.ui.components = [];

            overviewView.when(function() {
                const viewSurface = overviewView.container.querySelector(".esri-view-surface");
                domAttr.remove(viewSurface, "tabindex");
                // console.log("viewSurface", viewSurface);
            });

            const extentDiv = document.getElementById("extentDiv");

            // overviewView.when(function() {
                
                // Update the overview extent whenever the MapView or SceneView extent changes
                // console.log("overviewView.when", this, this.mainView);

                overviewView.watch("extent", lang.hitch(this, updateOverviewExtent));
                this.mainView.watch("extent", lang.hitch(this, updateOverviewExtent));
    
                // Update the minimap overview when the main view becomes stationary
                watchUtils.when(overviewView, "stationary", lang.hitch(this, updateOverview));
                this.watch("scaleFactor", lang.hitch(this, function(event) {
                    // console.log("scaleFactor", this.scaleFactor);
                    lang.hitch(this, updateOverview);
                    // lang.hitch(this, updateOverviewExtent);
                }));
    
                function updateOverview() {
                    // console.log("updateOverviewt");
                    // Animate the MapView to a zoomed-out scale so we get a nice overview.
                    // We use the "progress" callback of the goTo promise to update
                    // the overview extent while animating
                    if(overviewView.ready) {
                        const scale = this.mainView.scale * this.scaleFactor * Math.max(this.mainView.width / overviewView.width,
                            this.mainView.height / overviewView.height);
                        // console.log("updateOverview", this.scaleFactor, scale);
                        overviewView.goTo({
                            center: this.mainView.center,
                            scale: scale
                        });
                    }
                }
    
                function updateOverviewExtent() {
                    // console.log("updateOverviewExtent");
                    // Update the overview extent by converting the SceneView extent to the
                    // MapView screen coordinates and updating the extentDiv position.
                    var extent = this.mainView.extent;
        
                    var bottomLeft = overviewView.toScreen(extent.xmin, extent.ymin);
                    var topRight = overviewView.toScreen(extent.xmax, extent.ymax);
        
                    extentDiv.style.top = topRight.y + "px";
                    extentDiv.style.left = bottomLeft.x + "px";
        
                    extentDiv.style.height = (bottomLeft.y - topRight.y) + "px";
                    extentDiv.style.width = (topRight.x - bottomLeft.x) + "px";
                }
            // },
            // function(error) {
            //     console.log("error", error);
            // })
        }));
    }
}

export = MyOverviewMap;


