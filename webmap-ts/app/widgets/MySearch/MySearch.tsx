/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import Collection = require("esri/core/Collection");

import FeatureLayerSearchSource = require("esri/widgets/Search/FeatureLayerSearchSource");
import LocatorSearchSource = require("esri/widgets/Search/LocatorSearchSource");

import { tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
// import { Has } from "../../utils";

@subclass("esri.widgets.Search")
class Search extends declared(Widget) {

    @property()
    config: ApplicationConfig;

    @property()
    mapView: __esri.MapView | __esri.SceneView;

    render() {
        return (
            <div afterCreate={this._addSearch}>
            </div>
        );
    }

    private _addSearch = (element:Element) => {
        require([
            "esri/widgets/Search",
            "esri/tasks/Locator", 
            "esri/layers/FeatureLayer",
            "esri/core/lang"
            ], lang.hitch(this, function(Search, Locator, FeatureLayer, esriLang) {
            const defaultSources : Collection<FeatureLayerSearchSource|LocatorSearchSource> = new Collection<FeatureLayerSearchSource|LocatorSearchSource>();

            //setup geocoders defined in common config
            if (
                this.config.helperServices.geocode &&
                this.config.locationSearch
            ) {
                // console.log("geocoders", this.config.helperServices.geocode);
                const geocoders = lang.clone(this.config.helperServices.geocode);
                
                geocoders.forEach(
                    lang.hitch(this, function(geocoder) {
                        // console.log("geocoder", geocoder);
                        if (
                            geocoder.url && geocoder.url.indexOf(
                                ".arcgis.com/arcgis/rest/services/World/GeocodeServer"
                            ) > -1
                        ) {
                            geocoder.hasEsri = true;
                            geocoder.locator = new Locator(geocoder.url);

                            geocoder.singleLineFieldName = "SingleLine";
                            
                            geocoder.outFields = ["*"]; //["Match_addr"];
                            if (!this.config.countryCodeSearch.isNullOrWhiteSpace()) {
                                geocoder.countryCode = this.config.countryCodeSearch;
                            }

                            geocoder.name = geocoder.name || "Esri World Geocoder";
                            if (geocoder.name === "Esri World Geocoder") {
                                geocoder.name = i18n.EsriWorldGeocoder;
                            }

                            if (this.config.searchExtent) {
                                geocoder.searchExtent = this.mapView.extent;
                                geocoder.localSearchOptions = {
                                    minScale: 300000,
                                    distance: 50000
                                };
                            }
                            defaultSources.push(geocoder);
                        } else if (geocoder.singleLineFieldName && geocoder.singleLineFieldName != undefined) {
                            //Add geocoders with a singleLineFieldName defined
                            geocoder.locator = new Locator(geocoder.url);

                            defaultSources.push(geocoder);
                        }
                    })
                );
            }

            //add configured search layers to the search widget
            var configuredSearchLayers =
                this.config.searchLayers instanceof Array ? this.config.searchLayers : JSON.parse(this.config.searchLayers);
            configuredSearchLayers.forEach(
                lang.hitch(this, function(layer) {
                    const map : __esri.WebMap = this.mapView.map;
                    const mapLayer = map.layers.find(l => l.id ==layer.id );
                    if (mapLayer) {
                        const source : FeatureLayerSearchSource = new FeatureLayerSearchSource({
                            featureLayer: mapLayer,
                        });
                        // source.featureLayer = mapLayer;

                        if (
                            layer.fields &&
                            layer.fields.length &&
                            layer.fields.length > 0
                        ) {
                            source.searchFields = layer.fields;
                            source.displayField = layer.fields[0];
                            source.outFields = ["*"];
                            // searchLayers = true;
                            defaultSources.push(source);
                        }
                    }
                })
            );

            //Add search layers defined on the web map item
            // if (
            //     this.config.response.itemInfo.itemData &&
            //     this.config.response.itemInfo.itemData.applicationProperties &&
            //     this.config.response.itemInfo.itemData.applicationProperties
            //         .viewing &&
            //     this.config.response.itemInfo.itemData.applicationProperties
            //         .viewing.search
            // ) {
            //     const searchOptions = this.config.response.itemInfo.itemData
            //         .applicationProperties.viewing.search;

            //         searchOptions.layers.forEach(
            //             lang.hitch(this, function(searchLayer) {
            //             //we do this so we can get the title specified in the item
            //             const operationalLayers = this.config.itemInfo.itemData
            //                 .operationalLayers;
            //                 let layer = null;
            //             operationalLayers.some(function(opLayer) {
            //                 if (opLayer.id === searchLayer.id) {
            //                     layer = opLayer;
            //                     return true;
            //                 }
            //             });

            //             if (layer && layer.hasOwnProperty("url")) {
            //                 const source = {} as FeatureLayerSearchSource;
            //                 let url = layer.url;
            //                 let name = layer.title || layer.name;

            //                 if (esriLang.isDefined(searchLayer.subLayer)) {
            //                     url = url + "/" + searchLayer.subLayer;
            //                     layer.layerObject.layerInfos.some(
            //                         function(info) {
            //                             if (info.id === searchLayer.subLayer) {
            //                                 name +=
            //                                     " - " +
            //                                     layer.layerObject.layerInfos[
            //                                         searchLayer.subLayer
            //                                     ].name;
            //                                 return true;
            //                             }
            //                         }
            //                     );
            //                 }

            //                 source.featureLayer = new FeatureLayer(url);

            //                 source.name = name;

            //                 source.exactMatch = searchLayer.field.exactMatch;
            //                 source.displayField = searchLayer.field.name;
            //                 source.searchFields = [searchLayer.field.name];
            //                 source.placeholder = searchOptions.hintText;
            //                 // source.infoTemplate = layer.infoTemplate;
            //                 defaultSources.push(source);
            //                 // searchLayers = true;
            //             }
            //         })
            //     );
            // }

            defaultSources.forEach(function(source: FeatureLayerSearchSource) {
                if (
                    !source.placeholder ||
                    source.placeholder === undefined ||
                    source.placeholder === ""
                ) {
                    if (source.featureLayer && source.featureLayer.title) {
                        source.placeholder =
                            i18n.searchEnterCriteria +
                            " " +
                            source.featureLayer.title;
                    } else {
                        source.placeholder = i18n.searchPlaceholder;
                    }
                }
            });
            // search.set("sources", defaultSources);



            document.getElementById("searchLabel").innerHTML = i18n.search;
            const searchWidget = new Search({
              view: this.mapView,
              container: domConstruct.create("div",{},element),
              sources: defaultSources
            });
            // console.log("Search", searchWidget)
          }));
    }

}

export = Search;
