/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/_base/lang", "dojo/dom-construct", "esri/core/Collection", "esri/widgets/Search/FeatureLayerSearchSource", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, lang, domConstruct, Collection, FeatureLayerSearchSource, widget_1, i18n) {
    "use strict";
    // import { Has } from "../../utils";
    var Search = /** @class */ (function (_super) {
        __extends(Search, _super);
        function Search() {
            var _this = _super.call(this) || this;
            _this._addSearch = function (element) {
                require([
                    "esri/widgets/Search",
                    "esri/tasks/Locator",
                    "esri/layers/FeatureLayer",
                    "esri/core/lang"
                ], lang.hitch(_this, function (Search, Locator, FeatureLayer, esriLang) {
                    var defaultSources = new Collection();
                    //setup geocoders defined in common config
                    if (this.config.helperServices.geocode &&
                        this.config.locationSearch) {
                        // console.log("geocoders", this.config.helperServices.geocode);
                        var geocoders = lang.clone(this.config.helperServices.geocode);
                        geocoders.forEach(lang.hitch(this, function (geocoder) {
                            // console.log("geocoder", geocoder);
                            if (geocoder.url && geocoder.url.indexOf(".arcgis.com/arcgis/rest/services/World/GeocodeServer") > -1) {
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
                            }
                            else if (geocoder.singleLineFieldName && geocoder.singleLineFieldName != undefined) {
                                //Add geocoders with a singleLineFieldName defined
                                geocoder.locator = new Locator(geocoder.url);
                                defaultSources.push(geocoder);
                            }
                        }));
                    }
                    //add configured search layers to the search widget
                    var configuredSearchLayers = this.config.searchLayers instanceof Array ? this.config.searchLayers : JSON.parse(this.config.searchLayers);
                    configuredSearchLayers.forEach(lang.hitch(this, function (layer) {
                        var map = this.mapView.map;
                        var mapLayer = map.layers.find(function (l) { return l.id == layer.id; });
                        if (mapLayer) {
                            var source = new FeatureLayerSearchSource({
                                featureLayer: mapLayer,
                            });
                            // source.featureLayer = mapLayer;
                            if (layer.fields &&
                                layer.fields.length &&
                                layer.fields.length > 0) {
                                source.searchFields = layer.fields;
                                source.displayField = layer.fields[0];
                                source.outFields = ["*"];
                                // searchLayers = true;
                                defaultSources.push(source);
                            }
                        }
                    }));
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
                    defaultSources.forEach(function (source) {
                        if (!source.placeholder ||
                            source.placeholder === undefined ||
                            source.placeholder === "") {
                            if (source.featureLayer && source.featureLayer.title) {
                                source.placeholder =
                                    i18n.searchEnterCriteria +
                                        " " +
                                        source.featureLayer.title;
                            }
                            else {
                                source.placeholder = i18n.searchPlaceholder;
                            }
                        }
                    });
                    // search.set("sources", defaultSources);
                    // document.getElementById("searchLabel").innerHTML = i18n.search;
                    var _search = new Search({
                        view: this.mapView,
                        container: domConstruct.create("div", {}, element),
                        sources: defaultSources
                    });
                    document.getElementById("searchLabel").innerHTML = _search.label;
                    _search.maxResults = 25;
                    _search.maxSuggestions = 12;
                    _search.minSuggestCharacters = 3;
                    _search.viewModel.defaultSymbol.url = "images/SearchPin.png";
                    _search.viewModel.defaultSymbol.yoffset = 25;
                    _search.viewModel.defaultSymbol.width = 50;
                    _search.viewModel.defaultSymbol.height = 50;
                    _search.viewModel.defaultSymbol.name = "SearchMarker";
                    this.search.resolve(_search);
                    // console.log("Search", _search)
                }));
            };
            return _this;
        }
        Search.prototype.render = function () {
            return (widget_1.tsx("div", { afterCreate: this._addSearch }));
        };
        __decorate([
            decorators_1.property()
        ], Search.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], Search.prototype, "mapView", void 0);
        __decorate([
            decorators_1.property()
        ], Search.prototype, "search", void 0);
        Search = __decorate([
            decorators_1.subclass("esri.widgets.Search")
        ], Search);
        return Search;
    }(decorators_1.declared(Widget)));
    return Search;
});
//# sourceMappingURL=MySearch.js.map