/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import domClass = require("dojo/dom-class");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");

import ClonePanel = require("./ClonePanel");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.AddressManager")
  class AddressManager extends declared(Widget) {
  
    // @property()
    // mapView: __esri.MapView;

    // @property()
    // @renderable()
    // scaleFactor: number = 2;
  
    constructor() {
        super(); 
    }

    @property()
    clonePanel: ClonePanel = null;

    @property()
    config: any = {};

    @property()
    siteAddressPointLayer;

    @property()
    roadsLayer;

    @property()
    parcelsLayer;

    @property()
    roadFieldName: string;


    render() {
        // console.log("mapView", this.mapView);
        return ( 
        <div afterCreate={this._addAddressManager} class="AddressManager">
            <div class="toolbar">
            <input type="image" src="../images/icons_transp/addAddress.bggray.24.png" class="button" afterCreate={this._addAddressButton} title="Add Address Point" data-dojo-attach-event="onclick:_onDigitizeAddressClicked"></input>
            <div class="dropdown_moreTools">
                <input type="image" src="../images/icons_transp/Generate.bggray.24.png" class="button" afterCreate={this._addMoreToolsButton} data-dojo-attach-event="click:_dropdownMoreToolsToggle" aria-label="Clone Addresses" title="Clone Addresses"></input>
                <div afterCreate={this._addClonePanel} ></div>
            </div>
            <input type="image" src="../images/icons_transp/parcels.bggray.24.png" class="button"  afterCreate={this._addFillParcelsButton} data-dojo-attach-event="click:_onFillParcelClicked" aria-label="Fill Parcels" title="Fill Parcels"></input>
            </div>
        </div>
        );
    }

    private _addAddressManager = (element: Element) => {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/core/watchUtils",
            "dojo/text!./AddressManager.json"
        ], (Map, MapView, watchUtils, config) => {
            this.config = JSON.parse(config);
            // console.log("config", this.config, this);

            const getLayer = lang.hitch(this, function(alias:string) {
                const layers = this.mapView.map.allLayers.items;
                const result = layers.find((layer) => { 
                    return layer.title == this.config.services[alias]; 
                });
                return result;
            });

            this.siteAddressPointLayer = getLayer("siteaddresspoint");
            this.roadsLayer = getLayer("roadsegment");
            this.parcelsLayer = getLayer("parcel");
            this.roadFieldName = "fullname";
        });
     
    }

    private 

    private _addClonePanel = (element: Element) => {
        // console.log("element", element);
        // require(["./ClonePanel"], ClonePanel =>{
            this.clonePanel = new ClonePanel({container: element as HTMLElement});
        // });
    }

    private _addAddressButton = (element: Element) => {
        this.own(on(element, "click", this._activateButton));
    }

    private _addMoreToolsButton = (element: Element) => {
        this.own(on(element, "click", lang.hitch(this, this._toggleMoreToolsButton)));
    }

    private _addFillParcelsButton = (element: Element) => {
        this.own(on(element, "click", this._activateButton));
    }

    private _activateButton(event) {
        // console.log("_activateButton", event);
        domClass.add(event.target, "active");
    }
    
    private _toggleMoreToolsButton(event) {
        if(this.clonePanel) {
            domClass.toggle(event.target, "active");
            this.clonePanel.show(domClass.contains(event.target, "active"));
        }
    }

}


export = AddressManager;