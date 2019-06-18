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
import Deferred = require("dojo/Deferred");

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
    parcelLayer;

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
            // if (this.showMode == PickupRoads.MODE_ALL) {
            //     this._showList();
            // }
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
            <div class="pickupRoads hide" afterCreate={this._addDomNode}>
                <div class="header" data-dojo-attach-point="pickupRoadsHeader">
                    <label><input type="radio" name="showRoads" afterCreate={this._addShowRoads} value="Address Point" checked />From Address Point</label>
                    <label><input type="radio" name="showRoads" afterCreate={this._addShowRoads} value="Parcel" />From Parcel</label>
                    <label><input type="radio" name="showRoads" afterCreate={this._addShowRoads} value="All" />All</label>
                    <span afterCreate={this._addRoadCount} style="float:right;"></span>
                </div>
                <div class="roadsList">
                    <ul afterCreate={this._addPickupRoadsList} tabindex="0">
            
                    </ul>
                </div>
                <div class="footer" data-dojo-attach-point="pickupRoadsFooter">
                    <div afterCreate={this._addFooter1} class="hide">
                        <label>
                            <span style="margin-right:4px;">Max Distance:</span>
                            <input type="range" style="width:110px; height:16px;" min="20" max="200" step="10" name="maxDistance" data-dojo-attach-event="change:onMaxDistance" value="50" />
                        </label>
                        <span style="margin-left: 4px;" data-dojo-attach-point="distance">50</span>
                        <span style="float:right;">Meters</span>
                    </div>
                    <div afterCreate={this._addFooter2}>
                        <input type="checkbox" afterCreate={this._addExtentOnly} aria-label="Extent Only" />
                        <span>Extent Only</span>
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
            const value = input.value;
            console.log("input.value", value);

            switch (value) {
                case PickupRoads.MODE_ALL:
                        this.showListAll(this.extentOnly.checked);
                        break;
                case PickupRoads.MODE_ADDRESS_POINT:
                    break;
                case PickupRoads.MODE_PARCEL:
                    break;
            }
        }))
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
            const checked = extentOnly.checked;
        }))
    }

    private showListAll = (extentOnly) => {
        if(extentOnly) {
            const q = this.roadsLayer.createQuery();
            q.outFields = [this.roadFieldName];
            q.returnGeometry = true;
            q.where = "1=1";
            q.geometry = this.mapView.extent;
            q.spatialRelationship = "intersects";
            q.returnDistinctValues = false;
            this.roadsLayer.queryFeatures(q).then(
            results => {
                // const roads = results.features;
                const uniqueRoads = this._getUniqueRoads(results);
                
                // roads.map(r => ({name: r.attributes[this.roadFieldName], geometry: r.geometry}));
                // uniqueRoads.sort((a, b) => { return ("" +a.name).localeCompare(b.name)})
                this._showListAll(uniqueRoads);
            })
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
                    // tags[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
                }
            }
        });
    }
}

export = PickupRoads;
  
