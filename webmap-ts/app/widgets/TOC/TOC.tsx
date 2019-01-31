/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import { tsx } from "esri/widgets/support/widget";
import i18n = require("dojo/i18n!../nls/resources");
import { Has } from "../../utils";


const CSS = {
    // base
    base: "toc toc-panel",
    list: "toc-panel__list",
    listItem: "toc-panel__listItem",
}

@subclass("esri.widgets.TOC")
class TOC extends declared(Widget) {

    @property()
    config: ApplicationConfig;

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
            // console.log("allLayers", this.layers);
            
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
                    innerHTML: layer.title.NormalizeTitle(),
                }, label);
                const settings = domConstruct.create ("div", {
                    class: "toc-panel__listItem--settings",
                    id: `toc-settings_${i}`
                }, li);
                if(Has(this.config, "featureTable")) {
                    domConstruct.create("img", {
                        src: "./images/TableClose.png",
                        alt: i18n.TOC.openFeatureTable,
                        title: i18n.TOC.openFeatureTable,
                    }, settings);
                }
            })

            require(["esri/core/watchUtils"], (watchUtils) => {
                const isVisibleAtScale = (layer : any) : boolean => {
                    return (layer.minScale <= 0 || mapView.scale <= layer.minScale) &&
                    (layer.maxScale <= 0 || mapView.scale >= layer.maxScale)
                } 

                watchUtils.when(mapView, "stationary", () => {
                    // console.log("layers", this.layers);
                    this.layers.forEach((layer : any, i) => {
                        if(layer && layer.title) {
                            const title = layer.title.NormalizeTitle();
                            const visibleAtScale = isVisibleAtScale(layer);
                            const visibleScaleStr = i18n.TOC.visibleAtScale;
                            const notVisibleScaleStr = i18n.TOC.notVisibleAtScale;
                            // console.log(i, isVisibleAtScale(layer), layer.title, layer.minScale, mapView.scale, layer.maxScale);
                            const span = dom.byId("pageBody_layers").querySelector(`input[data-layerId="${layer.id}"] + span`);
                            domStyle.set(span, "font-weight", `${visibleAtScale ? "bold" : "normal"}`);
                            domAttr.set(span, "title", visibleAtScale ? visibleScaleStr : notVisibleScaleStr);
                            domAttr.set(span, "aria-label", `${visibleAtScale ? `${title}, ${visibleScaleStr}` : `${title}, ${notVisibleScaleStr}`}`);
                            // console.log(i, isVisibleAtScale(layer), span);
                        }
                        else {
                            // console.log("? layer title", layer);
                        }
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
