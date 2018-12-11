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

const CSS = {
    // base
    base: "toc toc-panel",
    list: "toc-panel__list",
    listItem: "toc-panel__listItem",
}

@subclass("esri.widgets.TOC")
class TOC extends declared(Widget) {

    // @property()
    // config: ApplicationConfig;

    @property()
    view: __esri.MapView | __esri.SceneView;
    
    render() {
        return (
            <div class={CSS.base}>
                <ul afterCreate={this._addTOC} bind={this} class={CSS.list}></ul>
            </div>
        );
    }

    private layers: __esri.Collection<__esri.Layer> = null

    private _addTOC = (element: Element) => {
        this.layers = this.view.map.layers;
        console.log("allLayers", this.layers);
        
        this.layers.forEach((layer, i) => { 
            const li = domConstruct.create("li", {
                "data-item": i,
                tabindex:0, 
                class: CSS.listItem,
                "aria-hidden": true
            }, element) ;
            const label = domConstruct.create ("label", {
                "aria-hidden": true
            }, li);
            domConstruct.create ("input", {
                type: "checkBox",
                "data-item": i,
                "data-layerId": layer.id,
                onclick: this._flipLayerVisibility,
                checked: layer.visible
            }, label);
            domConstruct.create ("span", {
                innerHTML: layer.title.replace("_", " "),
            }, label);
        })
    }

    private _flipLayerVisibility = (event) => {
        const layer = this.layers.find((layer) => { return layer.id == event.target.attributes["data-layerId"].value});
        layer.visible = event.target.checked;
        // console.log("_flipLayerVisibility", this.layers, event.target.attributes["data-item"].value, event.target.attributes["data-layerId"].value, layer, event);
    }
}

export = TOC;
