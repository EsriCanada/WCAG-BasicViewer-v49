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
                    <div class="infoPanel_Footer--navBar">
                        <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Prev} title={i18n.popupInfo.Prev} class="infoPanel_Footer--navBar-leftArrow" alt='Previous' afterCreate={this._addedPrevBtn}></input>
                        <span aria-live="polite" aria-atomic="true" afterCreate={this._addedNavContent} class="infoPanel_Footer--navContent"></span>
                        <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Next} title={i18n.popupInfo.Next} class="infoPanel_Footer--navBar-rightArrow" alt='Next'  afterCreate={this._addedNextBtn}></input>
                    </div>
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
        this.mapView.popup.dockEnabled = true;

        require(["dojox/layout/ContentPane"], (ContentPane) => { 
            this.contentPanel = new ContentPane({
                region: "center",
                id: "popupInfoContent",
                // tabindex: 0,
            }, dom.byId("feature_content"));
            this.contentPanel.startup();
            this._showInstructions();
        });

        // console.log("popup, mapView", this.mapView.popup, this.mapView);

        this.Init();
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

    private _showFooter = (index:number, count:number) => {
        if(this.navContentSpan && count > 1) {
            this.navContentSpan.innerHTML = "{0} of {1}".Format(index, count);
            domStyle.set(this._footer, "display", "");
        }
        else {
            domStyle.set(this._footer, "display", "none");
        }
    }

    private _hideFooter = () => {
        domStyle.set(this._footer, "display", "none");
    }

    private navContentSpan :HTMLElement;
    private _addedNavContent = (element: Element) => {
        this.navContentSpan = element as HTMLElement;
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
        this.ShowError("");
    }

    public ShowError = (error: string) => {
        this.errorText.innerHTML = error;
    }

    // private popup;
    private navContentIndex: number = 1;
    private navContentCount: number = 1;
    private Init = () => {
        this.mapView.popup.featureNavigationEnabled = false;

        console.log("popup", this.mapView.popup);
        this.own(this.mapView.popup.watch("featureCount", count => {
            this.navContentCount = count;
            if(this.navContentCount>0) {
                this._showFooter(this.navContentIndex, this.navContentCount);
            }
            else {
                this._showInstructions();
            }
        }));

        this.own(this.mapView.popup.watch("selectedFeatureIndex", index => {
            this.navContentIndex = index + 1;
            // if(this.navContentCount>0) {
            //     const popup = this.mapView.popup as any;
            //     console.log("selectedFeatureWidget", popup.selectedFeatureWidget, popup);
            //     this.contentPanel.set("content", popup.selectedFeatureWidget.title);
            // }
            this.navContentSpan.innerHTML = "{0} of {1}".Format(this.navContentIndex, this.navContentCount);
        }));

        this.own(this.mapView.popup.watch("selectedFeatureWidget", widget => {
            console.log("selectedFeatureWidget", widget);
            if(widget) {
                // widget._renderContent().then(content => this.contentPanel.set("content", content));
                setTimeout(() => {this.contentPanel.set("content", widget.title);}, 500)
                
            }
        }));
            // require(["esri/widgets/Popup"], (Popup) => {
        //     this.popup = new Popup({
        //         content: "this is my content",

        //     })
        // }
    }

    private _addedPrevBtn = (element: Element) => {
        const prevBtn = element as HTMLElement;
        this.own(on(prevBtn, "click", (event) => {
            this.mapView.popup.previous();
        }))
    }
    private _addedNextBtn = (element: Element) => {
        const nextBtn = element as HTMLElement;
        this.own(on(nextBtn, "click", (event) => {
            this.mapView.popup.next();
        }))
    }
}


export = InfoPanel;