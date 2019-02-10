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

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.InfoPanel")
  class InfoPanel extends declared(Widget) {
  
    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    @renderable()
    score: number = 0;

    constructor() {
        super();
    }

    render() {
        const showScore = this.score ? "" : "display:none;";
        return (
    <div class="infoPanel">
    	<div id="popupInfoContentWrapper" tabindex="0" style="height:100%;" afterCreate={this._addContentPanel}>
            <div >
                <div id="feature_content"></div>
            </div>
        </div>
        <table width='100%' role='presentation' class='infoPanel_Footer' style="display:none;" afterCreate={this._addedFooter}>
            <tr>
                <td width='33%'>
                    <span class='infoPanel_Footer-locator--Score' style={showScore}>{i18n.popupInfo.Score} <span>{this.score}%</span></span>
                </td>
                <td style='text-align:center;' width='34%' role='navigation'>
                    <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Prev} title={i18n.popupInfo.Prev} style='transform: rotate(90deg);' alt='Previous' class='popupInfoButton prev'></input>
                    <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Next} title={i18n.popupInfo.Next} style='transform: rotate(-90deg);' alt='Next' class='popupInfoButton next'></input>
                </td>
                <td width='33%' style='text-align:right;'>
                    <a class='infoPanel_Footer-locator--Copy' tabindex="0" title={i18n.geoCoding.CopyToClipboard} style="display:none;">{i18n.geoCoding.Copy}</a>
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
    }

    private _showInstructions = () => {
        this.contentPanel.set("content", i18n.popupInfo.instructions);
        this.own(on(dom.byId("linkToMap"), "click", () => {this.mapView.focus();}));
    }

    private _footer: HTMLElement;
    private _addedFooter = (element: Element) => {
        this._footer = element as HTMLElement;
    }

    private _showFooter = () => {
        domStyle.set(this._footer, "display", "");
    }

    private _hideFooter = () => {
        domStyle.set(this._footer, "display", "none");
    }

    // private scoreValue: HTMLElement;
    // private _addedScoreValue = (element: Element) => {
    //     this.scoreValue = element as HTMLElement;
    // }
}


export = InfoPanel;