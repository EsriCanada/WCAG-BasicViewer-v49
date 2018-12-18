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

// import FilterItem = require("./FilterItem")

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
                    <input id={`${this.id}_btn`} type="radio" name="FilterTabsGroup" onchange={this._filterTabChange}></input>
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

                <div class="tabContent" id={`${this.id}_page`} afterCreate={this._addFilterContent}>
                    <div class="filter-filterItem__filterAdd">
                        <label for="{this.id}_fieldCombo">{i18n.FilterTab.attribute}</label>
                        <select id="{this.id}_fieldCombo"autofocus tabindex="0" afterCreate={this._addFieldsCombo}></select>
                        
                        <button class="filter-filterItem__button esri-widget--button esri-icon-plus" 
                        aria-label={i18n.FilterTab.add} 
                        title={i18n.FilterTab.add} 
                        afterCreate={this._addInput}
                        // onclick={this._filterAdd} 
                        // style="float: right;"
                        />
                    </div>

                    <ul afterCreate={this._addFilterList}></ul>

                    <div class="filterButtons">
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.apply} onclick={this._filterApply}/>
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.ignore} onclick={this._filterIgnore}/>
                    </div>
                </div>

            </div>
        );
    }

    private _addFilterTab = (elemenet: Element) => {
        console.log("layer", this.layer.title);
    }

    private ulFilterList : HTMLElement;
    private _addFilterList = (element:Element) => {
        this.ulFilterList = element as HTMLElement;
    }

    private filterTabContentPage: any;
    private _addFilterContent = (element: Element) => {
        this.filterTabContentPage = element;
        const filterTabsContent = dom.byId("filterTabsContent");
        domConstruct.place(element, filterTabsContent);
        domStyle.set(element, "display", "none");
    }

    private _filterTabChange = (event) => {
        // console.log("_filterTabChange", event);
        const activePageId = this.filterTabContentPage.id;
        const tabContentPages = query(".tabContent", dom.byId("filterTabsCOntent"));
        tabContentPages.forEach((page: Element) => {
            domStyle.set(page, "display", page.id === activePageId ? "": "none");
        })
    }

    private fieldsCombo: any;
    private _addFieldsCombo = (element: Element) => {
        // console.log("_addFieldsCombo", this.layer);
        this.fieldsCombo = element;
        this.layer.when(() => {
            // if(this.layer.popupTemplate) {
                element.innerHTML = this.layer.popupTemplate.fieldInfos
                .filter((field) => field.visible)
                .map((field) => `<option value="${field.fieldName}">${NormalizeTitle(field.label)}</option>`)
                .join("");
            // } else {
            //     this.layer.fields.forEach((field) => {
            //         element.innerHTML += `<option value="${field.name}">${NormalizeTitle(field.alias)}</option>`;
            //     });
            // }
        });
    }

    private _filterTabKeyPress = (event) => {

    }

    private _filterAdd = (fieldId: string) => {
        console.log("_filterAdd fieldId", fieldId);
        // const field: __esri.Field = this.layer.fields.filter((field) => { return field.name == fieldId })[0];

        this.layer.when((layer: __esri.FeatureLayer) => {
            // console.log("layer", layer);
            const field: __esri.Field = layer.fields.filter((field) => {return field.name == fieldId;})[0];
            // console.log("_filterAdd layer", layer, "field", field);
            require(["./filterItem"], (FilterItem) => { 
                const filterItem = new FilterItem({
                    layer: layer, 
                    field: field, 
                    container: this.ulFilterList
                });
            });
        })
        // this.filterList.appendChild(filterItem.domNode);
        // filterItem.startup(); 
        // this.FilterItems.push(filterItem); 
        // filterItem.on("removeFilterItem", lang.hitch(this, function (id) {
        //     this.FilterItems.splice(this.FilterItems.indexOf(filterItem), 1);
        //     if(this.FilterItems.length === 0) {
        //         this.filterIgnore();
        //     }
        // }));
        // filterItem.domNode.focus();
    }
    
    private _addInput = (element: Element) => {
        this.own(on(element, "click", (event) => {
            this._filterAdd(this.fieldsCombo.value);
        }));
    }

    private _filterApply = (event) => {

    }

    private _filterIgnore = (event) => {

    }
}

export = FilterTab;
