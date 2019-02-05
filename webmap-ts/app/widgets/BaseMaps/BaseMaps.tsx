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

        basemapGallery.watch("activeBasemap", (newBasemap, oldBasemap) => {
            console.log("activeBasemap", newBasemap);
        });
    }
}

export = BaseMaps;
  