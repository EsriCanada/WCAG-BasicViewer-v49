/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

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

@subclass("esri.widgets.FilterItem")
  class FilterItem extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    private fieldType;
    constructor() {
        super();
    }

    // private field_label: string = "field_label";
    // private Id: string = "id";

    render() {
        // this.layer.when(() => {
            this.fieldType = this.field.type;
            console.log("fieldType", this.fieldType, this.field);
        // })
        return (
            <div>
            <li tabindex="0" afterCreate={this._filterAdded}>
                <div class="filter-filterItem--header">
                    <label class="checkbox">
                        <input 
                            // id="Active_{this.field_label}_{this.Id}"
                            type="checkbox" 
                            class="checkbox" 
                            checked 
                            aria-label="Active" 
                            title="Active" 
                            data-dojo-attach-point="Active"/> 
                        {NormalizeTitle(this.field.alias)}
                    </label>
                    <button role="button" 
                        aria-label="remove" 
                        title="remove" 
                        class="esri-widget--button esri-icon-minus filter-filterItem__button"
                        afterCreate={this._filterItemRemove}></button>
                </div>
                <div afterCreate={this._filterItemAddContent}></div>
            </li>
            </div>
        );
    }

    private filterItem: Element;
    private _filterAdded = (element: Element) => {
        this.filterItem = element;
    }

    private _filterItemRemove = (element: Element) => {
        this.own(on(element, "click", (event) => { 
            this.filterItem.remove();
        }));
    }

    private _filterItemAddContent = (element: Element) => {
        switch(this.fieldType) {
            case "integer" :
            case "double" :
                this.layer.when(() => {
                    require(["./filterNumber"], (filterNumber) => { 
                        const filterItem = new filterNumber({
                            layer: this.layer, 
                            field: this.field, 
                            container: domConstruct.create("div", {}, element)
                        });
                    });
                })
                break;
            default : 
                element.innerHTML = `Unknown Field Type: '${this.fieldType}'`;
                break;
        }
    }

  }

export = FilterItem;