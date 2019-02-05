/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { ApplicationConfig } from "ApplicationBase/interfaces";

import BasemapGallery = require("esri/widgets/BasemapGallery");
import PortalBasemapsSource = require("esri/widgets/BasemapGallery/support/PortalBasemapsSource");

import dom = require("dojo/dom");
import domClass = require("dojo/dom-class");
import on = require("dojo/on");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import watchUtils = require("esri/core/watchUtils");
import { isConstructSignatureDeclaration } from "typescript";

@subclass("esri.widgets.BaseMaps")
  class BaseMaps extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;

    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    portal: __esri.Portal;

    render() {
        return (
<div>
    <div afterCreate={this._addedNode}/>
</div>
        );
    }

    private _addedNode = (element: Element) => {
        let source = null;
        if(!this.config.galleryGroupQuery.isNullOrWhiteSpace()) {
            source = new PortalBasemapsSource({
                query: this.config.galleryGroupQuery
            });
        }
        else {
            if(this.config.useVectorBasemaps && !this.portal.vectorBasemapGalleryGroupQuery.isNullOrWhiteSpace()) {
                source = new PortalBasemapsSource({
                    query: this.portal.vectorBasemapGalleryGroupQuery
                });
            } else {
                if(!this.config.portal.basemapGalleryGroupQuery.isNullOrWhiteSpace()) {
                    source = new PortalBasemapsSource({
                        query: this.portal.basemapGalleryGroupQuery
                    });   
                }
            }
        }
        // console.log("source", source);
        let basemapGallery;
        if(source) {
            basemapGallery = new BasemapGallery({
                view:this.mapView,
                source: source,
                container: element as HTMLElement
            });
        } else {
            basemapGallery = new BasemapGallery({
                view:this.mapView,
                container: element as HTMLElement
            });
        }

        this._readVectorMap(basemapGallery.activeBasemap);
        basemapGallery.watch("activeBasemap", (newBasemap, oldBasemap) => {
            this._readVectorMap(newBasemap);
            // console.log("activeBasemap", newBasemap);
        });
    }

    public hasVectorLayers = false;
    private readWidget = null;
    private readWidgetDeferrer = new Deferred();
    private _readVectorMap = (baseMap) => {
        // console.log("activeBasemap", baseMap);
        const vectorLayers = baseMap.baseLayers.items.filter(layer => { return layer.type=="vector-tile"});
        this.hasVectorLayers = vectorLayers.length > 0;
        // console.log("hasVectorLayers", this.hasVectorLayers, vectorLayers[0]);
        if(this.readWidget) {
            this.readWidget.tile = "";
            this.readWidget.content = ""
        }
        if(this.hasVectorLayers) {
            if(!this.readWidget) {
                require(["../ReadVectorMap/ReadVectorMap"], (ReadVectorMap) => {
                    this.readWidget = new ReadVectorMap({
                        vectorLayer: vectorLayers[0],
                        mapView: this.mapView,
                        title:  "",
                        content: "",
                        container: domConstruct.create("div",{},this.mapView.container)
                    })
                    this.readWidgetDeferrer.resolve(this.readWidget);
                })
            }
            this.readWidgetDeferrer.then((readWidget:any) => {
                readWidget.vectorLayer = vectorLayers[0];
            })
        }
        else {
            if(this.readWidget) {
                this.readWidget.vectorLayer = null;
            }
        }
    }
}

export = BaseMaps;
  