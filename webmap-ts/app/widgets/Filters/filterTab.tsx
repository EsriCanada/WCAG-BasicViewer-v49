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
    layer: __esri.Layer;

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
            <div><div class="FilterTab">
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
                    // style="display:none; left:-4px;"
                    alt={badgeTip} title={badgeTip}
                    // tabindex="0" 
                    />
            </label>
            </div></div>
        );
    }

    private _addFilterTab = (elemenet: Element) => {
        console.log("layer", this.layer.title);
    }

    private _filterTabChange = (event) => {

    }

    private _filterTabKeyPress = (event) => {

    }
}

export = FilterTab;
