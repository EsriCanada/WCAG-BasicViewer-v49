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
import FilterBase = require("./FilterBase");


@subclass("esri.widgets.FilterItem")
    class FilterItem extends declared(FilterBase) {

        render() {
        return (
            <div>
            <li tabindex="0" afterCreate={this._filterAdded}>
                <div class="filter-filterItem--header">
                    <input 
                        id={this.id+"_header"}
                        type="checkbox" 
                        class="checkbox" 
                        checked 
                        aria-label="Active" 
                        title="Active" 
                        data-dojo-attach-point="Active"/> 
                    <label 
                        class="checkbox"
                        for={this.id+"_header"}
                        >
                        <div>{this.field.alias.NormalizeTitle()}</div>
                    </label>
                    <button role="button" 
                        aria-label="remove" 
                        title="remove" 
                        class="esri-widget--button esri-icon-minus filter-filterItem__button"
                        afterCreate={this._filterItemRemove}>
                    </button>
                </div>
                <div class="filter-filterItem__Content" afterCreate={this._filterItemAddContent}></div>
                <div class='showErrors' style="display:none;" role="alert" afterCreate={this._addedShowError}></div>
            </li>
            </div>
        );
    }

    private showErrorDiv: HTMLDivElement;
    private _addedShowError = (element : Element) => {
        this.showErrorDiv = element as HTMLDivElement;
    }

    public showError = (error: string) : void => {
        console.log("Error:", error);
        this.hasErrors = !error.isNullOrWhiteSpace();
        if(this.hasErrors) {
            domClass.add(this.filterItem, "filter-filterItem__hasErrors");
        } else {
            domClass.remove(this.filterItem, "filter-filterItem__hasErrors");
        }
        domStyle.set(this.showErrorDiv, "display", this.hasErrors ? "" : "none");
        this.showErrorDiv.innerHTML = error;
    }

    private filterItem: HTMLElement;
    private _filterAdded = (element: Element) => {
        this.filterItem = element as HTMLElement;
    }

    private _filterItemRemove = (element: Element) => {
        this.own(on(element, "click", (event) => { 
            this.filterItem.remove();
        }));
    }

    private _filterItemAddContent = (element: Element) => {
        console.log("_filterItemAddContent", this.field.name, ": ", this.field.type);
        
        switch(this.field.type) {
            case "integer" :
            case "double" :
                this.layer.when(() => {
                    require(["./FilterNumber"], (filterNumber) => { 
                        const filterItem = new filterNumber({
                            layer: this.layer, 
                            field: this.field, 
                            tool: this.tool,
                            showErrors: this.showError,
                            container: element
                        });
                    });
                })
                break;
            case "string" :
                this.layer.when(() => {
                    require(["./FilterString"], (filterString) => { 
                        const filterItem = new filterString({
                            layer: this.layer, 
                            field: this.field, 
                            tool: this.tool,
                            showErrors: this.showError,
                            container: element
                        });
                    });
                })
                break;
            case "date" :
                this.layer.when(() => {
                    require(["./FilterDate"], (filterDate) => { 
                        const filterItem = new filterDate({
                            layer: this.layer, 
                            field: this.field, 
                            tool: this.tool,
                            showErrors: this.showError,
                            container: element
                        });
                    });
                })
                break;
            default : 
                setTimeout(() => this.showError(`Unknown Field Type: '${this.field.type}'`), 50);
                break;
        }
    }

}

export = FilterItem;