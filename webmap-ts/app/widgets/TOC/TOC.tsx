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
        this.view.when((mapView) => {
            this.layers = mapView.map.layers;
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
                    "data-layerId": layer.id,
                    onclick: this._flipLayerVisibility,
                    checked: layer.visible
                }, label);
                domConstruct.create ("span", {
                    innerHTML: NormalizeTitle(layer.title),
                }, label);
            })

            require(["esri/core/watchUtils"], (watchUtils) => {
                const isVisibleAtScale = (layer : any) : boolean => {
                    return (layer.minScale <= 0 || mapView.scale <= layer.minScale) &&
                    (layer.maxScale <= 0 || mapView.scale >= layer.maxScale)
                } 

                watchUtils.when(mapView, "stationary", () => {
                    console.log("layers", this.layers);
                    this.layers.forEach((layer : any, i) => {
                        const title = NormalizeTitle(layer.title);
                        const visibleAtScale = isVisibleAtScale(layer);
                        const visibleScaleStr = i18n.TOC.visibleAtScale;
                        const notVisibleScaleStr = i18n.TOC.notVisibleAtScale;
                        // console.log(i, isVisibleAtScale(layer), layer.title, layer.minScale, mapView.scale, layer.maxScale);
                        const span = dom.byId("pageBody_layers").querySelector(`input[data-layerId="${layer.id}"] + span`);
                        domStyle.set(span, "font-weight", `${visibleAtScale ? "bold" : "normal"}`);
                        domAttr.set(span, "title", visibleAtScale ? visibleScaleStr : notVisibleScaleStr);
                        domAttr.set(span, "aria-label", `${visibleAtScale ? `${title}, ${visibleScaleStr}` : `${title}, ${notVisibleScaleStr}`}`);
                        // console.log(i, isVisibleAtScale(layer), span);
                    })
                });
            });
            
        })
    }

    private _flipLayerVisibility = (event) => {
        const layer = this.layers.find((layer) => { return layer.id == event.target.attributes["data-layerId"].value});
        layer.visible = event.target.checked;
        // console.log("_flipLayerVisibility", this.layers, event.target.attributes["data-item"].value, event.target.attributes["data-layerId"].value, layer, event);
    }

}

export = TOC;
