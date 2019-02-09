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

    constructor() {
        super();
    }

    render() {
        return (
    <div afterCreate={this._addInfoPanel} class="infoPanel">
    	<div id="popupInfoContentWrapper" tabindex="0" style="height:100%;"  afterCreate={this._addContentPanel}>
            <div >
                <div id="feature_content"></div>
            </div>
        </div>
        <div id="popupInfoFooter" style="display:none;">
            <table width='100%' role='presentation' class='infoPanelFooter'>
                <tr>
                    <td width='33%'>
                        <span id='locatorScore' class='locatorScore'>{i18n.popupInfo.Score} <span afterCreate={this._addScore}></span></span>
                    </td>
                    <td id='infoPanelFooterNavigation' width='34%' style='text-align:center;' role='navigation' aria-label="footerNavigation">
                        <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Prev} title={i18n.popupInfo.Prev} style='transform: rotate(90deg);' alt='Previous' class='popupInfoButton prev' data-dojo-attach-event='onclick: footerToPrev'></input>
                        <input type='image' src='images/icons_black/downArrow.png' aria-label={i18n.popupInfo.Next} title={i18n.popupInfo.Next} style='transform: rotate(-90deg);' alt='Next' class='popupInfoButton next' data-dojo-attach-event='onclick: footerToNext'></input>
                    </td>
                    <td width='33%' style='text-align:right;'>
                        <a id='locatorCopy' class='locatorCopy' tabindex="0" title={i18n.geoCoding.CopyToClipboard} data-dojo-attach-event='onclick: copyAddress'>{i18n.geoCoding.Copy}</a>
                    </td>
                </tr>
            </table>
        </div>
    </div>
        );
    }

    private infoPanelElement : HTMLDivElement;
    private _addInfoPanel = (element: Element) => {
        this.infoPanelElement = element as HTMLDivElement;
    }

    private contentElement : HTMLElement;
    private contentPanel: any;
    private _addContentPanel = (element: Element) => {
        this.contentElement = element as HTMLElement;
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
        const linkToMap = dom.byId("linkToMap");
        this.own(on(linkToMap, "click", () => {this.mapView.focus();}));
    }

    private score: HTMLElement;
    private _addScore = (element: Element) => {
        this.score = element as HTMLElement;
    }
     
}


export = InfoPanel;