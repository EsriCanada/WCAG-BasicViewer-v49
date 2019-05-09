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
// import config from "./AddressManager.json";
// console.log("config", config);

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.AddressManagemet")
  class AddressManagemet extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView;

    // @property()
    // @renderable()
    // scaleFactor: number = 2;
  
    constructor() {
        super();
        
    }

    config = {}

    render() {
        return ( 
        <div afterCreate={this._addAddressManager} class="AddressManager">
            <div class="toolbar">
            <input type="image" src="../images/icons_transp/addAddress.bggray.24.png" class="button" title="Add Address Point" data-dojo-attach-event="onclick:_onDigitizeAddressClicked"></input>
            <div class="dropdown_moreTools">
            <input type="image" src="../images/icons_transp/Generate.bggray.24.png" class="button" data-dojo-attach-event="click:_dropdownMoreToolsToggle" aria-label="Clone Addresses" title="Clone Addresses"></input>

            </div>
            <input type="image" src="../images/icons_transp/parcels.bggray.24.png" class="button" data-dojo-attach-event="click:_onFillParcelClicked" aria-label="Fill Parcels" title="Fill Parcels"></input>
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
            // console.log("config", this.config);
        });
     
    }
}


export = AddressManagemet;