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

    render() {
        return (
        <div afterCreate={this._addAddressManagemet}></div>
        );
    }

    private _addAddressManagemet = (element: Element) => {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/core/watchUtils"
        ], (Map, MapView, watchUtils) => {
            
        });
    
    }
}


export = AddressManagemet;