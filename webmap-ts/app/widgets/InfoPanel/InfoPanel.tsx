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
        this.ShowError("");
    }

    public ShowError = (error: string) => {
        this.errorText.innerHTML = error;
    }

    private popup;
    private Init = () => {
        console.log("popup", this.mapView.popup);
        this.own(this.mapView.popup.watch("featureCount", count => {
            if(count>1) {
                this._showFooter();
            }
            else {
                this._hideFooter();
            }
        }));

        // require(["esri/widgets/Popup"], (Popup) => {
        //     this.popup = new Popup({
        //         content: "this is my content",

        //     })
        // }
    }
}


export = InfoPanel;