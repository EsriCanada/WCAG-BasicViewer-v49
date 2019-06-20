/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");
import on = require("dojo/on");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");

import { tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import FilterItemBase = require("./FilterItemBase");

@subclass("esri.widgets.FilterCodedDomain")
class FilterCodedDomain extends declared(FilterItemBase) {
    @property()
    value: any;

    render() {
        return(
            <div class="filter__grid-container">
                <fieldset class="_fieldExamples" afterCreate={this._addListInput}>
                </fieldset>
            </div>
      )
    }

    private listInput: HTMLElement;

    private _addListInput = (element : Element) => {
        this.listInput = element as HTMLElement;
        (this.field.domain as any).codedValues.forEach(v => {
            if (v) {
                const id = `${this.id}_${v.code}`;
                const check = v.code == this.value ? ' checked' : '';
                this.listInput.innerHTML += `<label style="font-weight: bold;"><input type="checkbox" class="checkbox" value="${v.code}"${check}/>${v.name}</label><br />`;
            }
        });
    }

    public getFilterExpresion = () => {
        const list = Array.prototype.slice.call(this.listInput.children).filter(c => {
            return c.firstChild && c.firstChild.nodeName == "INPUT" && c.firstChild.checked;
        }).map(c => c.firstChild.value);
        if (!list || list.length === 0) {
            return null;
        } else if (list.length == 1) {
            return this.field.name + " = '" + list[0] + "'";
        } else {
            return this.field.name + " IN ('" + list.join().replace(/,/g, "', '") + "')";
        }
    }    

}

export = FilterCodedDomain;
