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

@subclass("esri.widgets.MyOverviewMap")
  class MyOverviewMap extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;

    @property()
    @renderable()
    scaleFactor: number = 2;
  
    @property()
    @renderable()
    scaleUnits: string = "metric";
  
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
        ], (Map, SceneView, MapView, ScaleBar, watchUtils) => {
            
            const conversionScale = {1:1.75, 2:4, 3:8, 4:15};

            const scaleFactor = this.scaleFactor;
            
            const mainView = this.mainView;
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
            }).when((overviewView) => {
                const scaleBar = new ScaleBar({
                    view: overviewView,
                    unit: this.scaleUnits,
                    style: "ruler",
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
                    title: i18n.overview.mapExtent,
                    "aria-label": `${i18n.overview.mapExtent}. ${i18n.overview.instructions}`
                    // draggable: "true",
                });

                overviewView.ui.add(extentDiv);

                extentDiv.onmousedown = (event) => {
                    // overviewView.ui.add(extentDiv);
                    // centers the extentDiv at (pageX, pageY) coordinates
                    const overviewDiv = dom.byId("overviewDiv");
                    const offsetX = overviewDiv.getBoundingClientRect().left;
                    const offsetY = overviewDiv.getBoundingClientRect().top;
                    const shiftX = event.clientX - extentDiv.getBoundingClientRect().left;
                    const shiftY = event.clientY - extentDiv.getBoundingClientRect().top;
                
                    let x = 0;
                    let y = 0;
                    function moveAt(pageX, pageY) {
                        extentDiv.style.left = (x = (pageX - shiftX)) + 'px';
                        extentDiv.style.top = (y = (pageY - shiftY)) + 'px';
                    }
                
                    function dropable(x, y) {
                        return document.elementsFromPoint(x, y).filter(el => el.id == "overviewDiv").length > 0;
                    }

                    let mouseOn = false;
                    function releaseMouse(mainView) {
                        // console.log("releaseMouse", mainView);
                        document.removeEventListener('mousemove', onMouseMove);
                        extentDiv.onmouseup = null;
                        
                        // console.log("offest", x, y, offsetX, offsetY);
                        extentDiv.style.left = (x-offsetX) + 'px';
                        extentDiv.style.top = (y-offsetY) + 'px';
                        overviewView.ui.add(extentDiv);

                        // console.log("this.mainView 1", this.mainView);
                        updateMainView(mainView)
                    }
                

                    function onMouseMove(event) {
                        // const elemsBelow = document.elementsFromPoint(event.clientX, event.clientY).filter(el => el.id == "overviewDiv");
                        // console.log("elemsBelow", elemsBelow);
                        if(mouseOn) {
                            if(dropable(event.clientX, event.clientY)) {
                                // console.log("MouseMove", event);
                                moveAt(event.pageX, event.pageY);
                            } 
                            else {
                                console.log("this.mainView", this.mainView);
                                releaseMouse(this.mainView);
                            }
                        }
                    }
                
                    if(event.button === 0) {
                        mouseOn = true;
                        // console.log("mouseDown", event);
                        // console.log("offset", offsetX, offsetY);
                        // extentDiv.style.position = 'absolute';
                        document.body.append(extentDiv);
                    
                        moveAt(event.pageX, event.pageY);
                    
                       // (3) move the extentDiv on mousemove
                        on(document, 'mousemove', onMouseMove);
                    
                        // (4) drop the extentDiv, remove unneeded handlers
                        extentDiv.onmouseup = () => {
                            // console.log("this.mainView", this.mainView);
                            releaseMouse(this.mainView);
                            mouseOn = false;
                        };
                    
                    }
                }
                
                on(extentDiv, "wheel", (event) => {
                    if(document.activeElement === extentDiv) {
                        // console.log("wheel", event);
                        const overviewMapScale = dom.byId("overviewMapScale");
                        if(event.deltaY > 10 && this.scaleFactor < 4) {
                            domAttr.set(overviewMapScale, "value", ++this.scaleFactor); 
                        }
                        else if(event.deltaY < 10 && this.scaleFactor > 1) {
                                domAttr.set(overviewMapScale, "value", --this.scaleFactor); 
                        }
                    }
                })

                on(extentDiv, "keydown", (event) => {
                    let top:any  = domStyle.get(extentDiv, "top");
                    let left:any = domStyle.get(extentDiv, "left");
                    // console.log("top left", top, left);
                    switch (event.keyCode) {
                        case 38: // up
                            if (top > -extentDiv.clientHeight / 2) {
                                domStyle.set(extentDiv, "top", `${--top}px`);
                            }
                            break;
                        case 40: // down
                            if (top < extentDiv.parentElement.offsetHeight - extentDiv.clientHeight / 2) {
                                domStyle.set(extentDiv, "top", `${++top}px`);
                            }
                            break;
                        case 37: // left
                            if (left > -extentDiv.clientWidth / 2) {
                                domStyle.set(extentDiv, "left", `${--left}px`);
                            }
                            break;
                        case 39: // right
                            if (left < extentDiv.parentElement.offsetWidth - extentDiv.clientWidth / 2) {
                                domStyle.set(extentDiv, "left", `${++left}px`);
                            }
                            break;
                        case 33: //pgup
                            if (
                                top > -extentDiv.clientHeight / 2 &&
                                left > -extentDiv.clientWidth / 2
                            ) {
                                domStyle.set(extentDiv, "left", `${++left}px`);
                                domStyle.set(extentDiv, "top", `${--top}px`);
                            }
                            break;
                        case 34: //pgdn
                            if (
                                top <
                                    extentDiv.parentElement.offsetHeight -
                                        extentDiv.clientHeight / 2 &&
                                left > -extentDiv.clientWidth / 2
                            ) {
                                domStyle.set(extentDiv, "left", `${++left}px`);
                                domStyle.set(extentDiv, "top", `${++top}px`);
                            }
                            break;
                        case 36: //home
                            if (
                                top > -extentDiv.clientHeight / 2 &&
                                left <
                                    extentDiv.parentElement.offsetWidth -
                                        extentDiv.clientWidth / 2
                            ) {
                                domStyle.set(extentDiv, "left", `${--left}px`);
                                domStyle.set(extentDiv, "top", `${--top}px`);
                            }
                            break;
                        case 35: //end
                            if (
                                top <
                                    extentDiv.parentElement.offsetHeight -
                                        extentDiv.clientHeight / 2 &&
                                left <
                                    extentDiv.parentElement.offsetWidth -
                                        extentDiv.clientWidth / 2
                            ) {
                                domStyle.set(extentDiv, "left", `${--left}px`);
                                domStyle.set(extentDiv, "top", `${++top}px`);
                            }
                            break;
                    }
                    switch (event.keyCode) {
                        case 9: // tab
                        // case 33: // PgUp
                        // case 34: // PgDn
                        case 27: // Esc
                            break;
                        default:
                            event.stopPropagation();
                            event.preventDefault();
                            break;
                    }
                });
    
                on(extentDiv, "keyup", (event) => {
                    // console.log('key', event.keyCode);
                    const overviewMapScale = dom.byId("overviewMapScale");
                    switch (event.keyCode) {
                        case 38: // up
                        case 40: // down
                        case 37: // left
                        case 39: // right
                        case 34: //pgdn
                        case 33: //pgup
                        case 36: //home
                        case 35: //end
                            // console.log("call updateMainView", updateMainView)
                            updateMainView(this.mainView); 
                            break;
                        case 107 : //+
                        case 187 :
                            if(this.scaleFactor < 4)
                                domAttr.set(overviewMapScale, "value", ++this.scaleFactor); 
                            break;
                        case 109 : //-
                        case 189 :
                            if(this.scaleFactor > 1)
                                domAttr.set(overviewMapScale, "value", --this.scaleFactor); 
                    break;
                    }
                    switch (event.keyCode) {
                        case 9: // tab
                        // case 33: // PgUp
                        // case 34: // PgDn
                        case 27: // Esc
                            break;
                        default:
                            event.stopPropagation();
                            event.preventDefault();
                            break;
                    }
                });

                overviewView.watch("extent", lang.hitch(this, updateOverviewExtent));
                this.mainView.watch("extent", lang.hitch(this, updateOverviewExtent));
    
                // Update the minimap overview when the main view becomes stationary
                watchUtils.when(overviewView, "stationary", lang.hitch(this, updateOverview));
                this.watch("scaleFactor", (event) => updateOverview);
                // }));
        
                function updateOverview() {
                    // console.log("updateOverviewt");
                    // Animate the MapView to a zoomed-out scale so we get a nice overview.
                    // We use the "progress" callback of the goTo promise to update
                    // the overview extent while animating
                    if(overviewView.ready) {
                        
                        const scale = this.mainView.scale * conversionScale[this.scaleFactor] * Math.max(this.mainView.width / overviewView.width,
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

                function updateMainView(mainView) {
                    // console.log("updateMainView", this);
                    const extentDiv = dom.byId("extentDiv") as HTMLElement;
                    const overviewDiv = dom.byId("overviewDiv");
                    const overv = overviewDiv.getBoundingClientRect();
                    const bound = extentDiv.getBoundingClientRect();
                    // console.log("bound", bound);
                    const mapCenter = overviewView.toMap({x:bound.left - overv.left + bound.width/2, y:bound.top  - overv.top + bound.height/2});
                    // console.log("center", mapCenter);
                    mainView.goTo({center: [mapCenter.longitude, mapCenter.latitude]});
                    extentDiv.focus();
                }
            });
        });
    
    }
}


export = MyOverviewMap;