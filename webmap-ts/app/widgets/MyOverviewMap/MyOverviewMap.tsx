/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
// import * as Promise from 'lib';

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import dom = require("dojo/dom");
import on = require("dojo/on");
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

    @property()
    @renderable()
    scaleFactor: number = 2;
  
    private conversionScale = {1:2, 2:3, 3:6, 4:12};
            
    constructor() {
        super();
    }

    render() {
        return (
        <div afterCreate={this._addOverviewMap} style="position:absolute; bottom:20px; left:20px; z-index:2;"></div>
        );
    }

    private _addOverviewMap = (element: Element) => {
        require([
            "esri/Map",
            "esri/views/SceneView",
            "esri/views/MapView",
            "esri/widgets/ScaleBar",
            "esri/core/watchUtils"
        ], lang.hitch(this, function(Map, SceneView, MapView, ScaleBar, watchUtils) {
            
            const overviewMap = new Map ({
                basemap: "topo"
            });

            new MapView({
                container: domConstruct.create("div", {
                    id: "overviewDiv"
                }, element.parentNode),
                map: overviewMap,
                constraints: {
                  rotationEnabled: false
                }
              }).when(lang.hitch(this, function(overviewView) {
                const scaleBar = new ScaleBar({
                    view: overviewView,
                    container: element
                });
                  
                overviewView.ui.components = [];

                const viewSurface = overviewView.container.querySelector(".esri-view-surface");
                domAttr.remove(viewSurface, "tabindex");

                // console.log("overviewView", overviewView);
                const extentDiv = domConstruct.create("div", {
                    id: "extentDiv",
                    tabindex: 0,
                    role: "application",
                    title: "Map Extent",
                    // draggable: "true",
                });

                overviewView.ui.add(extentDiv);

                extentDiv.onmousedown = function(event) {
                    // overviewView.ui.add(extentDiv);
                    // centers the extentDiv at (pageX, pageY) coordinates
                    const shiftX = event.clientX - extentDiv.getBoundingClientRect().left;
                    const shiftY = event.clientY - extentDiv.getBoundingClientRect().top;
                
                    let x = 0;
                    let y = 0;
                    function moveAt(pageX, pageY) {
                        extentDiv.style.left = (x = (pageX - shiftX)) + 'px';
                        extentDiv.style.top = (y = (pageY - shiftY)) + 'px';
                    }
                
                    let currentDroppable = null;
                    function onMouseMove(event) {

                        const elemsBelow = document.elementsFromPoint(event.clientX, event.clientY).filter(el => el.id == "overviewDiv");
                        // console.log("elemsBelow", elemsBelow);
                        if(elemsBelow.length > 0) {
                            moveAt(event.pageX, event.pageY);
                        }
                    }
                
                    if(event.button === 0) {
                        const overviewDiv = dom.byId("overviewDiv");
                        const offsetX = overviewDiv.getBoundingClientRect().left;
                        const offsetY = overviewDiv.getBoundingClientRect().top;
                        console.log("mouseDown", event);
                        console.log("offset", offsetX, offsetY);
                        // extentDiv.style.position = 'absolute';
                        document.body.append(extentDiv);
                    
                        moveAt(event.pageX, event.pageY);
                    
                       // (3) move the extentDiv on mousemove
                        document.addEventListener('mousemove', onMouseMove);
                    
                        // (4) drop the extentDiv, remove unneeded handlers
                        extentDiv.onmouseup = function() {
                            document.removeEventListener('mousemove', onMouseMove);
                            extentDiv.onmouseup = null;
                            
                            console.log("offest", x, y, offsetX, offsetY);
                            extentDiv.style.left = (x-offsetX) + 'px';
                            extentDiv.style.top = (y-offsetY) + 'px';
                            overviewView.ui.add(extentDiv);
                        };
                    
                    }
            };
                  
                //   extentDiv.ondragstart = function() {
                //     return false;
                //   };
                // on(dom.byId("extentDiv"), 'dragstart', lang.hitch(this, (ev) => {
                //     const data = {id: ev.target.id, clientX: ev.clientX, clientY: ev.clientY, clientLeft: ev.target.clientLeft, clientTop: ev.target.clientTop, x: ev.x, y: ev.y};
                //     console.log("dragstart", "ev", ev);
                //     console.log("data", data);
                //     ev.dataTransfer.setData("overviewDiv", JSON.stringify(data));
                // }));
                // on(dom.byId("overviewDiv"), 'dragover', lang.hitch(this, (ev) => {
                //     // console.log("dragover", ev);
                //     ev.preventDefault();
                // }));
                // on(dom.byId("overviewDiv"), 'drop', lang.hitch(this, (ev) => {
                //     ev.preventDefault();
                //     var data = JSON.parse(ev.dataTransfer.getData("overviewDiv"));
                //     const Obj = {id: ev.target.id, x: ev.x, y: ev.y};
                //     console.log("drop", "ev", ev);
                //     console.log("data", data);
                //     console.log("Obj", Obj);
                //     const pageBody_overview= dom.byId("pageBody_overview");
                //     const overviewDiv = dom.byId("overviewDiv");
                //     // const compStyle = domStyle.getComputedStyle(overviewDiv);
                //     const Height = Number(domStyle.get(pageBody_overview, "height"));
                //     const height = Number(domStyle.get(overviewDiv, "height"));
                //     const Width = Number(domStyle.get(pageBody_overview, "width"));
                //     const width = Number(domStyle.get(overviewDiv, "width"));
                //     const left = (Width-width)/2;
                //     const top = (Height-height)/2;
                //     console.log("top", top, "Height", Height, "Y", Obj.y);
                //     console.log("left", left, "Width", Width, "X", Obj.x);
                //     const target = dom.byId(data.id);
                //     domStyle.set(target, "left", `${left+Obj.x}px`);
                //     // domStyle.set(target, "top", `${Height-top+Obj.y}px`);
                //     console.log("target", target);
                //     // debugger;
                // }));
            
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
                        
                        const scale = this.mainView.scale * this.conversionScale[this.scaleFactor] * Math.max(this.mainView.width / overviewView.width,
                            this.mainView.height / overviewView.height);
                        // console.log("updateOverview", this.scaleFactor, scale);
                        // overviewView.map.l;
                        overviewView.goTo({
                            center: this.mainView.center,
                            scale: scale,
                            // zoom: this.scaleFactor
                        }).then(() => {
                            // console.log("Scale", `${scale} -> ${overviewView.scale}`);
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
            }));
        }));
    }
}

export = MyOverviewMap;


