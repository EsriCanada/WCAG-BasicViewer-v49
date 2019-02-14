/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import Graphic = require("esri/Graphic");
import Geometry = require("esri/geometry/Geometry");

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.InfoPanel")
  class InfoPanel extends declared(Widget) {
  
    @property()
    mapView: __esri.MapView;

    @property()
    search: any;

    constructor() {
        super();
    }

    render() {
        return (
    <div class="infoPanel">
    	<div id="popupInfoContentWrapper" tabindex="0" style="height:100%;" afterCreate={this._addContentPanel}>
            <div >
                <div id="feature_content"></div>
            </div>
        </div>
        <table width='100%' role='presentation' class='infoPanel_Footer'>
            <tr>
                <td colSpan="3" aria-live="polite" aria-atomic="true" class="errorText"><span afterCreate={this._addedError}></span></td>
            </tr>
            <tr afterCreate={this._addedFooter}>
                <td width='33%'>
                    <span class='infoPanel_Footer-locator--Score' afterCreate={this._addedScore}>{i18n.popupInfo.Score} <span afterCreate={this._addedScoreValue}></span>%</span>
                </td>
                <td style='text-align:center;' width='34%' role='navigation'>
                    <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Prev} title={i18n.popupInfo.Prev} style='transform: rotate(90deg);' alt='Previous' class='popupInfoButton prev'></input>
                    <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Next} title={i18n.popupInfo.Next} style='transform: rotate(-90deg);' alt='Next' class='popupInfoButton next'></input>
                </td>
                <td width='33%' style='text-align:right;'>
                    <a class='infoPanel_Footer-locator--Copy' tabindex="0" title={i18n.geoCoding.CopyToClipboard} afterCreate={this._addedCopyLink}>{i18n.geoCoding.Copy}</a>
                </td>
            </tr>
        </table>
    </div>
        );
    }

    private contentPanel: any;
    private _addContentPanel = (element: Element) => {
        require(["dojox/layout/ContentPane"], (ContentPane) => { 
            this.contentPanel = new ContentPane({
                region: "center",
                id: "popupInfoContent",
                // tabindex: 0,
            }, dom.byId("feature_content"));
            this.contentPanel.startup();
            this._showInstructions();
        });
        this.search.autoSelect = true;
        this.search.popupEnabled = false;
        on(this.search,'search-complete', event => this._searchComplete(event));
        console.log("search", this.search);
        // this.search._searchResultRenderer.container = this.contentPanel;
        // this.mapView.popup.container = this.contentPanel;
        this.mapView.popup.dockEnabled = true;

        this.mapView.popup.actions.removeAll();
        // const PanAction : any = {
        //     title: "Pan To",
        //     id: "pan-to-this",
        //     image: "images/PanTo.16.png"
        // };

        // this.mapView.popup.actions.push(PanAction);

        // this.own(this.mapView.popup.on("trigger-action", (event) => {
        //     // Execute the measureThis() function if the measure-this action is clicked
        //     if (event.action.id === "pan-to-this") {
        //         // console.log("pan-to-this", event, event.target.selectedFeature);
        //         const geometry : Geometry = event.target.selectedFeature.geometry;
        //         this.mapView.goTo(geometry);
        //     }
        // }));

        this.own(this.mapView.popup.watch("selectedFeature", feature => {
            // console.log("selectedFeature", feature);
            this.RemoveLastLocation();
            const geometry : Geometry = feature.geometry;
            if(geometry) {
                const isVisibleAtScale = (layer : any) : boolean => {
                    return (layer.minScale <= 0 || this.mapView.scale <= layer.minScale) &&
                    (layer.maxScale <= 0 || this.mapView.scale >= layer.maxScale)
                } 
                if(feature.layer) {
                    if(feature.layer.geometryType == "point" && !isVisibleAtScale(feature.layer)) {
                        const options={target:geometry, scale:((feature.layer.maxScale+feature.layer.minScale)/2)};
                        console.log("options", options);
                        this.mapView.goTo(options);
                    }
                    else {
                        this.mapView.goTo(geometry);
                    }
                } 
                else {
                    this.mapView.goTo(geometry);
                    this.mapView.graphics.add(feature);
                    this.lastLocation = feature;
                }
            }
        }));

        this.own(this.mapView.popup.watch("visible", (visible, oldVisible) => {
            // console.log("popup visible", oldVisible, visible);
            if(!visible) {
                this.RemoveLastLocation();
            }
        }));
        
        // (this.mapView.popup as any).updateLocationEnabled = true;
        console.log("popup, mapView", this.mapView.popup, this.mapView);
    }

    private lastLocation : any;
    public RemoveLastLocation = () => {
        if(this.lastLocation) {
            this.mapView.graphics.remove(this.lastLocation);
            this.lastLocation = null;
        }
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
                                feature.symbol = this.search.viewModel.defaultSymbol;
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

    private _showInstructions = () => {
        this.contentPanel.set("content", i18n.popupInfo.instructions);
        this.own(on(dom.byId("linkToMap"), "click", () => {this.mapView.focus();}));
    }

    private _footer: HTMLElement;
    private _addedFooter = (element: Element) => {
        this._footer = element as HTMLElement;
        this._hideFooter();
    }

    private _showFooter = () => {
        domStyle.set(this._footer, "display", "");
    }

    private _hideFooter = () => {
        domStyle.set(this._footer, "display", "none");
    }

    private scoreWrapper: HTMLElement;
    private _addedScore = (element: Element) => {
        this.scoreWrapper = element as HTMLElement;
        this._setScore(0);
    }
    private scoreValue: HTMLElement;
    private _addedScoreValue = (element: Element) => {
        this.scoreValue = element as HTMLElement;
    }

    private _setScore = (score:Number) => {
        this.scoreValue.innerHTML = score.toString();
        domStyle.set(this.scoreWrapper, "display", (score && score > 0 && score <= 100) ? "inherited" : "none");
    }

    private copyLink: HTMLElement;
    private _addedCopyLink = (element: Element) => {
        this.copyLink = element as HTMLElement;
        this._hideCopyLink();
    }

    private _showCopyLink = () => {
        domStyle.set(this.copyLink, "display", "");
    }

    private _hideCopyLink = () => {
        domStyle.set(this.copyLink, "display", "none");
    }

    
    private errorText: HTMLElement;
    private _addedError = (element: Element) => {
        this.errorText = element as HTMLElement;
        this._showError("");
    }

    private _showError = (error: string) => {
        this.errorText.innerHTML = error;
    }
}


export = InfoPanel;