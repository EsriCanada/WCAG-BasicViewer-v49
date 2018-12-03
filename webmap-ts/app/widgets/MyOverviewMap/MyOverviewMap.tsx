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

@subclass("esri.widgets.MyOverviewMap")
  class MyOverviewMap extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;
    // @property()
    // config: ApplicationConfig;
  
    // @property()
    // myToolPage : ToolPage;

    // @property()
    // @renderable()
    // active: boolean;
  
    constructor() {
        super();
    }
            
    render() {
        return (
        <div id="overviewDiv" afterCreate={this._addOverviewMap}>
            <div id="extentDiv"></div>
        </div>
        );
    }

    private _addOverviewMap = (element: Element) => {
        require([
            "esri/Map",
            "esri/views/SceneView",
            "esri/views/MapView",
            "esri/core/watchUtils"
          ], function(Map, SceneView, MapView, watchUtils) {
            
            const overviewMap = new Map({
                basemap: "topo"
            });
        
            const overviewView = new MapView({
                container: domConstruct.create("div", {
                    id: "overviewDiv",
                    
                }, domConstruct.create("div", {}, element)),
                map: overviewMap,
                constraints: {
                  rotationEnabled: false
                }
              });

              overviewView.ui.components = [];
              var extentDiv = document.getElementById("overviewDiv");

              overviewView.when(function() {
                // Update the overview extent whenever the MapView or SceneView extent changes
                overviewView.watch("extent", updateOverviewExtent);
                overviewView.watch("extent", updateOverviewExtent);
        
                // Update the minimap overview when the main view becomes stationary
                watchUtils.when(overviewView, "stationary", updateOverview);
        
                function updateOverview() {
                  // Animate the MapView to a zoomed-out scale so we get a nice overview.
                  // We use the "progress" callback of the goTo promise to update
                  // the overview extent while animating
                  overviewView.goTo({
                    center: this.mainView.center,
                    scale: this.mainView.scale * 2 * Math.max(this.mainView.width /
                      overviewView.width,
                      mainView.height / overviewView.height)
                  });
                }
        
                function updateOverviewExtent() {
                  // Update the overview extent by converting the SceneView extent to the
                  // MapView screen coordinates and updating the extentDiv position.
                  var extent = this.mapView.extent;
        
                  var bottomLeft = overviewView.toScreen(extent.xmin, extent.ymin);
                  var topRight = overviewView.toScreen(extent.xmax, extent.ymax);
        
                  extentDiv.style.top = topRight.y + "px";
                  extentDiv.style.left = bottomLeft.x + "px";
        
                  extentDiv.style.height = (bottomLeft.y - topRight.y) + "px";
                  extentDiv.style.width = (topRight.x - bottomLeft.x) + "px";
                }
            });
        });
}
}

export = MyOverviewMap;


