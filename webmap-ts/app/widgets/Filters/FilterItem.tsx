/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import on = require("dojo/on");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import FilterBase = require("./FilterBase");
import FilterItemBase = require("./FilterItemBase");


@subclass("esri.widgets.FilterItem")
class FilterItem extends declared(FilterBase) {

    @property()
    FilterPart: FilterItemBase;

    @property()
    value: any;

    render() {
        return (
            <div>
            <li tabindex="0" afterCreate={this._filterAdded}>
                <div class="filter-filterItem--header">
                    <input type="checkbox" checked id={this.id+"_header"} class="checkbox" aria-label="Active" title="Active" afterCreate={this._addedActive}/> 
                    <label class="checkbox" for={this.id+"_header"}>
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
        console.error("FilterItem:", error);
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

    private _addedActive = (element: Element) => {
        this.own(on(element, "change", (event) => { 
            this.active = event.target.checked;
            // console.log("Active", this.active);
        }));
    }

    private _filterItemRemove = (element: Element) => {
        this.own(on(element, "click", (event) => { 
            this.emit("removeFilterItem", {id: this.id});
            this.filterItem.remove();
        }));
    }

    private _filterItemAddContent = (element: Element) => {
        // console.log("_filterItemAddContent", this.field.name, ": ", this.field.type);
        
        this.layer.when(() => {
            if("domain" in (this.field as any) && this.field.domain) {
                require(["./FilterCodedDomain"], (FilterCodedDomain) => { 
                    this.FilterPart = new FilterCodedDomain({
                        layer: this.layer, 
                        field: this.field, 
                        tool: this.tool,
                        showErrors: this.showError,
                        value: this.value,
                        container: element
                    });
            })
            } else 
            switch(this.field.type) {
                case "integer" :
                case "double" :
                    require(["./FilterNumber"], (filterNumber) => { 
                        this.FilterPart = new filterNumber({
                            layer: this.layer, 
                            field: this.field, 
                            tool: this.tool,
                            showErrors: this.showError,
                            value: this.value,
                            container: element
                        });
                    });
                break;
                case "string" :
                    require(["./FilterString"], (filterString) => { 
                        this.FilterPart = new filterString({
                            layer: this.layer, 
                            field: this.field, 
                            tool: this.tool,
                            value: this.value,
                            showErrors: this.showError,
                            container: element
                        });
                    });
                break;
                case "date" :
                    require(["./FilterDate"], (filterDate) => { 
                        this.FilterPart = new filterDate({
                            layer: this.layer, 
                            field: this.field, 
                            tool: this.tool,
                            value: this.value,
                            showErrors: this.showError,
                            container: element
                        });
                    });
                break;
                default : 
                    this.FilterPart = null;
                    setTimeout(() => this.showError(`Unknown Field Type: '${this.field.type}'`), 50);
                    break;
            }
        })
    }

}

export = FilterItem;