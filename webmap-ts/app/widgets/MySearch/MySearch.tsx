/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import domConstruct = require("dojo/dom-construct");
import Collection = require("esri/core/Collection");
import Deferred = require("dojo/Deferred");
import Graphic = require("esri/Graphic");


import FeatureLayerSearchSource = require("esri/widgets/Search/LayerSearchSource");
import LocatorSearchSource = require("esri/widgets/Search/LocatorSearchSource");

import { tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import { Has } from "../../utils";
// import { Has } from "../../utils";

@subclass("esri.widgets.Search")
class Search extends declared(Widget) {

    @property()
    config: ApplicationConfig;

    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    search: Deferred<Search>;

    constructor() {
        super();
    }


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
            ], (Search, Locator, FeatureLayer, esriLang) => {
            const defaultSources : Collection<FeatureLayerSearchSource|LocatorSearchSource> = new Collection<FeatureLayerSearchSource|LocatorSearchSource>();

            //setup geocoders defined in common config
            if (
                this.config.helperServices.geocode &&
                this.config.locationSearch
            ) {
                // console.log("geocoders", this.config.helperServices.geocode);
                const geocoders = lang.clone(this.config.helperServices.geocode);
                
                geocoders.forEach(geocoder => {
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
            }

            //add configured search layers to the search widget
            var configuredSearchLayers =
                this.config.searchLayers instanceof Array ? this.config.searchLayers : JSON.parse(this.config.searchLayers);
            configuredSearchLayers.forEach(layer => {
                // const map : __esri.WebMap = this.mapView.map;
                const mapLayer = this.mapView.map.layers.find(l => l.id == layer.id );
                if (mapLayer) {
                    const source : FeatureLayerSearchSource = new FeatureLayerSearchSource({
                        layer: mapLayer,
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

            //Add search layers defined on the web map item
            // ? follow up

            defaultSources.forEach(function(source: FeatureLayerSearchSource) {
                if (
                    !source.placeholder ||
                    source.placeholder === undefined ||
                    source.placeholder === ""
                ) {
                    if (source.layer && source.layer.title) {
                        source.placeholder =
                            i18n.searchEnterCriteria +
                            " " +
                            source.layer.title;
                    } else {
                        source.placeholder = i18n.searchPlaceholder;
                    }
                }
            });

            const _search = new Search({
              view: this.mapView,
              container: domConstruct.create("div",{},element),
              sources: defaultSources,
              popupEnabled: false,
              maxResults: 25,
              maxSuggestions: 12,
              minSuggestCharacters: 3,
            });
            // document.getElementById("searchLabel").innerHTML = i18n.search;
            document.getElementById("searchLabel").innerHTML = _search.label;

            _search.viewModel.defaultSymbol.url = "images/SearchPin.png";
            _search.viewModel.defaultSymbol.yoffset = 20;
            _search.viewModel.defaultSymbol.width = 40;
            _search.viewModel.defaultSymbol.height = 40;
            _search.viewModel.defaultSymbol.name = "SearchMarker";
            on(_search,'search-complete', event => this._searchComplete(event));

            this.search.resolve(_search);
            // console.log("Search", _search)
        });
    }

    private _searchComplete = (event) => {
        console.log("search complete", event);
        if(event.numErrors == 0) {
            this._showError("");
            let features : Graphic[] = [];
            // console.log("results", event.results);
            for(let i= 0; i<event.results.length; i++) {
                const sourceResult = event.results[i];

                let popupTemplate = null;
                const isFeatureLayer = sourceResult.source.hasOwnProperty('featureLayer');
                if(isFeatureLayer) {
                    popupTemplate = sourceResult.source.featureLayer.popupTemplate;
                }
                require(["esri/PopupTemplate"], (PopupTemplate) => { 
                    sourceResult.results.forEach(result => {
                        const feature = result.feature;

                        if(isFeatureLayer) {
                            feature.popupTemplate = popupTemplate;
                        }
                        else {
                            feature.popupTemplate = new PopupTemplate(
                            {
                                title: i18n.geoCoding.Location,
                                content: this._makeSearchResultTemplate(feature.attributes)
                                // +this.makeSerchResultFooter(this.showSearchScore, dataFeatures.length > 1)
                            });
                            if(!feature.symbol) {
                                // this.search.viewModel.defaultSymbol.name="SearchMarker";
                                this.search.then(search => feature.symbol = (search as any).viewModel.defaultSymbol);
                            }
                            // console.log("feature", feature);
                        }
        
                        features.push(feature);
                    });
                });
            }
            console.log("features", features);

            // this.mapView.popup.clear();
            if(features.length > 0) {
                this.mapView.popup.open();
                this.mapView.popup.features = features;
                console.log("popup", this.mapView.popup);
            }
            else {
                this.mapView.popup.clear();
            }

        } else {
            let err = "";
            event.errors.forEach(error => {
                err += (err.isNullOrWhiteSpace() ? "" : "<br/>") + error;
            });
            this._showError(err);
        }
    }

    private _makeSearchResultTemplate = (attrs) => {
        // return "content goes here";
        const content=domConstruct.create("table", {style:"width:100%;", tabindex:"0", class:"esri-widget__table"});
        // console.log("attrs", attrs);
        Object.keys(attrs).forEach(key => {
            if (attrs.hasOwnProperty(key)) {
                // console.log("attr", key, attrs[key]);
                const tr = domConstruct.create("tr", {}, content);
                domConstruct.create("th", {innerHTML:key}, tr);
                domConstruct.create("td", {innerHTML:attrs[key]}, tr);
            }
        });
        return content;
    }

    private _showError = (error) => {
        // if(Has(this.config, "infoPanel")) {
        //     // ?
        // }
        if(!error.isNullOrWhiteSpace()) {
            console.log("Error", error);
            alert("Error: "+error);
        }
    }

}

export = Search;
