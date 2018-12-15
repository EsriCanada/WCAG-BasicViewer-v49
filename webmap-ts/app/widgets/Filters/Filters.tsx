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
import { NormalizeTitle } from "../../utils";

@subclass("esri.widgets.Filters")
  class Filters extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;

    constructor() {
        super();
    }

    render() {
        return (
            <div afterCreate={this._addFilters}></div>
        );
    }

    private layers: __esri.Collection<__esri.Layer> = null

    private _addFilters = (element: Element) => {
        this.mainView.when((mapView) => {
            this.layers = mapView.map.layers;

            const filterTabsZone = domConstruct.create("div", {
                class: "filterTabsZone"
            }, element);
            require(["./filterTab"], (FilterTab) => { 
                this.layers.forEach((layer, i) => {
                    new FilterTab({ layer: layer, id: `FilterTab_${i}`, container: filterTabsZone});
                })
            })
        });
    }
}


export = Filters;
