/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
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

    @property()
    get open() {
        return this._get("open")
    }
    set open(value: boolean) {
        this._set("open", value);
        html.setStyle(this.domNode, "display", value ? "" : "none");
        if (value) {
            html.setStyle(this.domNode, "width", html.getStyle(this.input, "width") + "px");
            // if (this.showMode == PickupRoads.MODE_ALL) {
            //     this._showList();
            // }
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
            <div class="pickupRoads" style="display:false;" afterCreate={this._addDomNode}>
                <div class="pickupRoads-header" data-dojo-attach-point="pickupRoadsHeader">
                    <label><input type="radio" name="showRoads" data-dojo-attach-event="change:onShowRoads" value="Address Point" checked />>From Address Point</label>
                    <label><input type="radio" name="showRoads" data-dojo-attach-event="change:onShowRoads" value="Parcel" />>From Parcel</label>
                    <label><input type="radio" name="showRoads" data-dojo-attach-event="change:onShowRoads" value="All" />>All</label>
                    <span data-dojo-attach-point="roadCount" style="float:right;"></span>
                </div>
                <div class="pickupRoads-list">
                    <div data-dojo-attach-point="pickupRoadsLoading" class="pickupRoads-list-loading">
                        <img src="./widgets/AddressManager/images/reload.gif" />>
                    </div>
                    <ul data-dojo-attach-point="pickupRoadsList" tabindex="0">
            
                    </ul>
                </div>
                <div class="pickupRoads-footer" data-dojo-attach-point="pickupRoadsFooter">
                    <label>
                        <span style="margin-right:4px;">Max Distance:</span>
                        <input type="range" style="width:110px; height:16px;" min="20" max="200" step="10" name="maxDistance" data-dojo-attach-event="change:onMaxDistance" value="50" />
                    </label>
                    <span style="margin-left: 4px;" data-dojo-attach-point="distance">50</span>
                    <span style="float:right;">Meters</span>
                </div>
            </div>
        )
    }   

    private _addDomNode = (element: Element) => {
        this.domNode = element as HTMLElement;
    }

}

export = PickupRoads;
  
