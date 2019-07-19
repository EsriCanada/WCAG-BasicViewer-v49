/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import query =require("dojo/query");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import domClass = require("dojo/dom-class");
import html = require("dojo/_base/html");

import UtilsViewModel = require("./UtilsViewModel");

import GeometryService = require("esri/tasks/GeometryService");
import geometryEngine = require("esri/geometry/geometryEngine");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import Draw = require("esri/views/draw/Draw");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import Polyline = require("esri/geometry/Polyline");
import Point = require("esri/geometry/Point");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import { watch } from "fs";
import CursorToolTip = require("./CursorToolTip");
import watchUtils = require("esri/core/watchUtils");

@subclass("esri.widgets.PickupRoads")
class PickupRoads extends declared(Widget) {

    static MODE_ALL = "All";
    static MODE_ADDRESS_POINT = "Address Point";
    static MODE_PARCEL = "Parcel";

    @property()
    mapView;

    @property()
    utils;

    @property()
    roadsLayer;

    @property()
    parcelsLayer;

    @property()
    input;

    @property()
    roadFieldName = "fullname";

    @property()
    selectionMade;

    private domNode: HTMLElement;
    private uniqueRoadNames: any[];
    private uniqueRoads: any[];
    private roadCount: HTMLElement;
    private pickupRoadsList: HTMLUListElement;
    private roadGraphic: Graphic;
    private road: any;
    private bufferRoadsDict: {};
    private footer1: HTMLElement;
    private footer2: HTMLElement;
    private extentOnly: HTMLInputElement;
    private showUnits: HTMLInputElement;
    private mode: any;
    private minMaxBtn: HTMLInputElement;
    private maxDistance: HTMLInputElement;
    private distance: HTMLElement;
    private buffer: any;
    
    @property()
    get namedGeometries(): any[] {
        return this._get("namedGeometries")
    };

    @property()
    get open() {
        return this._get("open")
    }
    set open(value: boolean) {
        this._set("open", value);
        // html.setStyle(this.domNode, "display", value ? "" : "none");
        if (value) {
            html.removeClass(this.domNode, "hide");
            html.setStyle(this.domNode, "width", html.getStyle(this.input, "width") + "px");

            if(this.mode == PickupRoads.MODE_ALL) {
                this.showListAll(this.extentOnly.checked);
            } else {
                this.showListByDistance();
            }
        } else {
            html.addClass(this.domNode, "hide");
        }
    }

    @property()
    get showMode() {
        return this._get("showMode");
    }
    set showMode(value) {
        if(this._get("showMode") != value) {
            this._set("showMode", value);
            // this._showList();
        }
    }

    @property("readonly")
    set feature(value) {
        this._set("feature", value);
        if (!this.open || this.showMode != PickupRoads.MODE_ALL) {
            // this._showList();
        }
    }

    render() {
        return ( 
            <div id="domNode" class="pickupRoads hide normal" afterCreate={this._addDomNode}>
                <div class="header" data-dojo-attach-point="pickupRoadsHeader">
                    <label><input type="radio" name="showRoads" afterCreate={this._addShowRoads} value="Address Point" checked />From Address Point</label>
                    <label><input type="radio" name="showRoads" afterCreate={this._addShowRoads} value="Parcel" />From Parcel</label>
                    <label><input type="radio" name="showRoads" afterCreate={this._addShowRoads} value="All" />All</label>
                    <div style="float:right;">
                        <span afterCreate={this._addRoadCount} ></span>
                        <input type="image" afterCreate={this._addMinMaxBtn} src="./images/icons_white/max_height.17.png" title="To Max Height" style="vertical-align: middle; margin-right: -8px;" />
                    </div>
                </div>
                <div class="roadsList">
                    <ul afterCreate={this._addPickupRoadsList} tabindex="0">
            
                    </ul>
                </div>
                <div class="footer" data-dojo-attach-point="pickupRoadsFooter">
                    <div afterCreate={this._addFooter1}>
                        <label>
                            <span style="margin-right:4px;">Max Distance:</span>
                            <input type="range" style="width:110px; height:16px;" min="20" max="200" step="10" name="maxDistance" afterCreate={this._addMaxDistance} value="50" />
                        </label>
                        <span style="margin-left: 4px;" afterCreate={this._addDistance} >50</span>
                        <span style="float:right;">Meters</span>
                    </div>
                    <div afterCreate={this._addFooter2} class="hide">
                        <label>
                            <input type="checkbox" afterCreate={this._addExtentOnly} title="Extent Only" />
                            <span>In Extent</span>
                        </label>
                        <div style="float:right;" class="hide" afterCreate={this._addUnits}>
                            <span>Meters</span>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    private _addDomNode = (element: Element) => {
        this.domNode = element as HTMLElement;

        this.roadsLayer.when(async layer => {

            return new Promise<any>(resolve => {
                const q = layer.createQuery();
                q.outFields = [this.roadFieldName];
                q.returnGeometry = true;
                q.where = "1=1";
                // q.spatialRelationship = "esriSpatialRelIntersects";
                // q.returnDistinctValues = true;
                this.roadsLayer.queryFeatures(q).then(
                    results => {
                        // const roads1 = results.features;

                        this.uniqueRoads = this._getUniqueRoads(results);
                        // console.log("uniqueRoads", this.uniqueRoads);

                        this._set("namedGeometries", this.uniqueRoads.map(r => {
                            const g = r.geometry;
                            g.roadName = r.name;
                            return g;
                        }));
                        // console.log("namedGeometries", this.namedGeometries);
    
                        resolve(this.uniqueRoads);
                    },
                    err => { console.log("init roads", err)
                });
            })
        })
    }

    private _addRoadCount = (element: Element) => {
        this.roadCount = element as HTMLElement;
    }

    
    private _addShowRoads = (element: Element) => {
        const input = element as HTMLInputElement;
        this.own(on(input, "change", event => {
            const input = event.target;
            if(!input.checked) return;
            this.mode = input.value;

            switch (this.mode) {
                case PickupRoads.MODE_ALL:
                    this.showListAll(this.extentOnly.checked);
                    html.addClass(this.footer1, "hide");
                    html.removeClass(this.footer2, "hide");
                    break;
                case PickupRoads.MODE_ADDRESS_POINT:
                    this.showListByDistance();
                    html.removeClass(this.footer1, "hide");
                    html.addClass(this.footer2, "hide");
                    break;
                case PickupRoads.MODE_PARCEL:
                    this.showListByDistance();
                    html.removeClass(this.footer1, "hide");
                    html.addClass(this.footer2, "hide");
                    break;
            }
        }))

        watchUtils.whenTrue(this.mapView, "stationary", () => {
            if(!this.open) return;
            this.showListAll(this.mode == PickupRoads.MODE_ALL && this.extentOnly.checked);
        })
    }

    private _addPickupRoadsList = (element: Element) => {
        this.pickupRoadsList = element as HTMLUListElement;
    }

    private _addFooter1 = (element: Element) => {
        this.footer1 = element as HTMLElement;
    }

    private _addFooter2 = (element: Element) => {
        this.footer2 = element as HTMLElement;
    }

    private _addExtentOnly = (element: Element) => {
        this.extentOnly = element as HTMLInputElement;
        this.own(on(this.extentOnly, "change", event => {
            const extentOnly = event.target;
            this.showListAll(extentOnly.checked)
            if(extentOnly.checked) {
                html.removeClass(this.showUnits, "hide");
            } else {
                html.addClass(this.showUnits, "hide");
            }
        }))
    }

    private _addUnits = (element: Element) => {
        this.showUnits = element as HTMLInputElement;
    }
    
    private _addMinMaxBtn = (element: Element) => {
        this.minMaxBtn = element as HTMLInputElement;
        this.own(on(this.minMaxBtn, "click", event => {
            const minMaxBtn = event.target;
            const domNode = html.byId("domNode");
            if((html as any).hasClass(domNode, "normal")) {
                minMaxBtn.src="./images/icons_white/min_height.17.png";
                minMaxBtn["aria-label"] = minMaxBtn.title = "To Normal Height";
                html.removeClass(domNode, "normal");
            } else {
                minMaxBtn.src="./images/icons_white/max_height.17.png";
                minMaxBtn["aria-label"] = minMaxBtn.title = "To Max Height";
                html.addClass(domNode, "normal");
            }
        }))
    }

    private _addMaxDistance = (element: Element) => {
        this.maxDistance = element as HTMLInputElement;
        this.own(on(this.maxDistance, "change", event => {
            this.distance.innerHTML = event.target.value;
            if (this.mode != PickupRoads.MODE_ALL) {
                this.showListByDistance();
            }
        }))
    }

    private _addDistance = (element: Element) => {
        this.distance = element as HTMLElement;
    }

    private showListAll = (extentOnly) => {
        if(extentOnly) {
            this._showListByDistance(this.mapView.extent, this.feature.geometry)
        }
        else {
            this._showListAll(this.uniqueRoads);
        }
    }

    private _getUniqueRoads(results: any) {
        const segments = results.features.map(segment => ({ name: segment.attributes["fullname"], geometry: segment.geometry }));
        const uniqueRoads = [];
        // this.bufferRoadsDict = {};
        segments.forEach(currentSegment => {
            let exists = uniqueRoads.find(segment => currentSegment.name == segment.name);
            if (!exists) {
                uniqueRoads.push(currentSegment);
                // this.bufferRoadsDict[currentSegment.name] = currentSegment.geometry;
            }
            else {
                exists.geometry = geometryEngine.union([exists.geometry, currentSegment.geometry]);
                // this.bufferRoadsDict[currentSegment.name] = exists.geometry;
            }
        });

        uniqueRoads.sort((a, b) => { return ("" +a.name).localeCompare(b.name)});

        return uniqueRoads;

    }

    private _showListAll(uniqueRoads: any[]) {
        this.pickupRoadsList.innerHTML = null;
        this.roadCount.innerHTML = "(" + uniqueRoads.length + "}";
        let prev = "";
        uniqueRoads.forEach(road => {
            if (road.name[0] != prev) {
                prev = road.name[0];
                html.create("li", { innerHTML: prev, class: "firstLetter", "data-letter": prev }, this.pickupRoadsList);
            }
            const li = html.create("li", { tabindex: "0" }, this.pickupRoadsList);
            const name = html.create("div", {
                innerHTML: road.name,
                class: "roadName"
            }, li);
            this.own(on(name, "mouseover", event => {
                // console.log("mouseover", event);
                const roadName = event.target.innerHTML;
                this.road = uniqueRoads.find(r => r.name == roadName);
                if (road) {
                    this.roadGraphic = new Graphic({ geometry: road.geometry, symbol: this.utils.SELECTED_ROAD_SYMBOL });
                    this.mapView.graphics.add(this.roadGraphic);
                }
            }));
            this.own(on(name, "mouseout", event => {
                if (this.roadGraphic) {
                    this.mapView.graphics.remove(this.roadGraphic);
                    this.roadGraphic = null;
                }
                // console.log("mouseout", event);
            }));
            this.own(on(li, "click", event => {
                const streetName = event.target.innerHTML;
                if (this.input.value != streetName) {
                    this.input.value = streetName;
                    if (this.selectionMade) {
                        this.selectionMade(streetName);
                    }
                }
            }));
        });
        on(this.pickupRoadsList, "keyup", event => {
            const key = event.key.toUpperCase();
            // console.log("keyEvent", key);
            if ((key >= "A" && key <= "Z") || (key >= "1" && key <= "9")) {
                const tags = query(".firstLetter[data-letter='" + key + "']");
                if (tags && tags.length === 1) {
                    (tags[0] as HTMLElement).scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            }
        });
    }

    private showListByDistance = () => {
        let bufferGeometry = null;
        if (this.mode === PickupRoads.MODE_PARCEL) {
            const q = this.parcelsLayer.createQuery();
            q.outFields = ["OBJECTID"];
            q.where = "1=1";
            q.geometry = this.feature.geometry;
            q.spatialRelationship = "esriSpatialRelWithin";
            q.returnGeometry = true;

            this.parcelsLayer.queryFeatures(q).then(results => {
                if (results.features.length === 1) {
                    bufferGeometry = geometryEngine.buffer(results.features[0].geometry, Number(this.maxDistance.value), "meters");
                    this._showListByDistance(bufferGeometry, results.features[0].geometry);
                } else {
                    console.error("unexpected nuber of parcels", results);
                    return;
                }
            })

        } else {
            bufferGeometry = geometryEngine.buffer(this.feature.geometry, Number(this.maxDistance.value), "meters");
            this._showListByDistance(bufferGeometry, this.feature.geometry);
        }        
    }

    private _showListByDistance = (geometry, refference) => {
        if (this.buffer) {
            this.utils._removeGraphic(this.buffer, this.mapView.graphics);
        }
        if (!this.feature || !this.open) return;

        let buffer = null;
        if (this.mode != PickupRoads.MODE_ALL) {
            const g = geometryEngine.intersect(geometry, this.mapView.extent);
            buffer = this.buffer = {geometry: g, symbol:this.utils.BUFFER_SYMBOL};
            this.mapView.graphics.add(this.buffer);
        }
        else {
            buffer = {geometry:this.mapView.extent};
        }

        const uniqueRoads = this.namedGeometries.filter(n => geometryEngine.intersects(n, buffer.geometry));
        //.map(g => ({name: g.roadName, geometry:g}));

        const roadDistances = [];
        uniqueRoads.forEach(road => {
            const roadDist = ({name: road.roadName, geometry:road, distance:geometryEngine.distance(refference, road, "meters")});
            roadDistances.push(roadDist);
        });
        roadDistances.sort((a, b) => a.distance - b.distance);
        // console.log("roadDistances", roadDistances);
        this.roadCount.innerHTML = "(" + roadDistances.length + ")";
        this.pickupRoadsList.innerHTML = null;
        roadDistances.forEach(road => {
            const li = html.create("li", { tabindex: "0", style: "display: flex; flex-direction: row;" }, this.pickupRoadsList);
            const name = html.create("div", {
                innerHTML: road.name,
                style: "flex-grow:1;",
                class: "roadName",
            }, li);
            this.own(on(name, "mouseover", event => {
                this.roadGraphic = new Graphic({geometry:road.geometry, symbol:this.utils.SELECTED_ROAD_SYMBOL});
                this.mapView.graphics.add(this.roadGraphic);
            }));
            this.own(on(name, "mouseout", event => {
                if (this.roadGraphic) {
                    this.mapView.graphics.remove(this.roadGraphic);
                    this.roadGraphic = null;
                }
            }));
            html.create("span", {
                innerHTML: Math.round(road.distance),
                style: "flex-grow:0; margin-right:4px;"
            }, li);
            this.own(on(name, "click", event => {
                const streetName = event.target.innerHTML;
                this.input.value = streetName;
                this.utils._removeGraphic(this.buffer, this.mapView.graphics);
                if (this.selectionMade) {
                    this.selectionMade(streetName);
                }
            }));
        })

    }
}

export = PickupRoads;
  
