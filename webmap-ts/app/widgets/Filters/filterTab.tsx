/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
// import * as Promise from 'lib';

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import { NormalizeTitle } from "../../utils";

@subclass("esri.widgets.FilterTab")
  class FilterTab extends declared(Widget) {
    @property()
    layer: __esri.FeatureLayer;

    @property()
    id: string;

    private layerTitle : string;

    constructor() {
        super();
    }

    render() {
        const layerTitle = NormalizeTitle(this.layer.title);
        const badgeTip = i18n.badgesTips.someFilters;
        return (
            <div>
                <div class="FilterTab">
                    {/* <div afterCreate={this._addFilterTab}>{NormalizeTitle(this.layer.title)}</div> */}
                    <input id={`${this.id}_btn`} type="radio" name="FilterTabsGroup" onchange={this._filterTabChange} value={`${this.id}_page`} ></input>
                    <label for={`${this.id}_btn`} aria-label={layerTitle}>
                        <span
                            tabindex="0"
                            onkeypress={this._filterTabKeyPress}
                            title={layerTitle}>
                            {layerTitle}
                        </span>
                        <img
                            id={`${this.id}_img`}
                            src="images/someFilters.png"
                            class="setIndicator"
                            style="display:none;"
                            alt={badgeTip} title={badgeTip}
                            />
                    </label>
                </div>

                <div class="tabContent tabHide" id={`${this.id}_page`} afterCreate={this._addFilterContent}>
                    <div class="filterAdd">
                        <label for={`${this.id}-fieldsCombo`}>{i18n.FilterTab.attribute}&nbsp;</label>
                        
                        <select id={`${this.id}-fieldsCombo`} autofocus tabindex="0" afterCreate={this._addFieldsCombo}>
                        </select>
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.add} onclick="_filterAdd" style="float: right;"/>
                    </div>

                    <ul data-dojo-attach-point="filterList"></ul>

                    <div class="filterButtons">
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.apply} onclick="_filterApply"/>
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.ignore} onclick="_filterIgnore"/>
                    </div>
                </div>

            </div>
        );
    }

    private _addFilterTab = (elemenet: Element) => {
        console.log("layer", this.layer.title);
    }

    private _addFilterContent = (element: Element) => {
        const filterTabsContent = dom.byId("filterTabsContent");
        domConstruct.place(element, filterTabsContent);
        domStyle.set(element, "display", "none");
    }

    private _filterTabChange = (event) => {
        // console.log("_filterTabChange", event);
        const activePageId = event.target.value;
        const tabContentPages = query(".tabContent", dom.byId("filterTabsCOntent"));
        tabContentPages.forEach((page: Element) => {
            domStyle.set(page, "display", page.id === activePageId ? "": "none");
        })
    }

    private _addFieldsCombo = (element: Element) => {
        console.log("_addFieldsCombo", this.layer);
        this.layer.when(() => {
            if(this.layer.popupTemplate) {
                // console.log("popupTemplate", 
                // this.layer.popupTemplate.fieldInfos,
                // this.layer.popupTemplate.fieldInfos.filter((field) => field.visible),
                // this.layer.popupTemplate.fieldInfos.filter((field) => field.visible).map((field) => `<option value="${field.fieldName}">${field.label}</option>`));
                element.innerHTML = this.layer.popupTemplate.fieldInfos
                .filter((field) => field.visible)
                .map((field) => `<option value="${field.fieldName}">${NormalizeTitle(field.label)}</option>`)
                .join("");
            } else {
                this.layer.fields.forEach((field) => {
                    element.innerHTML += `<option value="${field.name}">${NormalizeTitle(field.alias)}</option>`;
                });
            }
        });
    }

    private _filterTabKeyPress = (event) => {

    }

    private _filterAdd = (event) => {

    }

    private _filterApply = (event) => {

    }

    private _filterIgnore = (event) => {

    }
}

export = FilterTab;
