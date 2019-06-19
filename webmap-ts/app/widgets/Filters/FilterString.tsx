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

@subclass("esri.widgets.FilterString")
class FilterString extends declared(FilterItemBase) {
    @property()
    value: any;

    render() {
        return(
<div class="filter__grid-container">
  <select autofocus tabindex="0" 
    afterCreate={this._criteriaCreated}
        class="filter__grid-item filter__grid-criteria"
        aria-label={i18n.FilterItem.selectCriteria}
		>
		<option value=" = ">{i18n.FilterItem.equal}</option>
		<option value=" != ">{i18n.FilterItem.notEqual}</option>
		<option value=" LIKE ">{i18n.FilterItem.like}</option>
		<option value=" NOT LIKE ">{i18n.FilterItem.notLike}</option>
		<option value=" IN ">{i18n.FilterItem.in}</option>
		<option value=" NOT IN ">{i18n.FilterItem.notIn}</option>			
	</select>
	<input type="textbox"
        class="filter-filterItem__textBox--text filter__grid-item filter__grid-minValue"
        aria-label={i18n.FilterItem.enterValueToMatch}
        title={i18n.FilterItem.enterValueToMatch}
        afterCreate={this._addedTextBox}
    />
	<div class="filter__grid-item filter__grid-item--Examples">
		<ul class="" style="display:none;" afterCreate={this._addedListInput}></ul>
    </div>
</div>
      )
    }

    private valueTextBox: HTMLInputElement;
    private listInput: HTMLUListElement;

    private _addedTextBox = (element : Element) => {
        this.valueTextBox = element as HTMLInputElement;
    }

    private _addedListInput = (element : Element) => {
        this.listInput = element as HTMLUListElement;
    }

    private criteriaElement: HTMLSelectElement;
    private _criteriaCreated = (element:Element) => {
        this.criteriaElement = element as HTMLSelectElement;
        this.own(on(element, "change", (event) => { 
            switch(this._getListMode()) {
            case true: 
                domStyle.set(this.valueTextBox, 'display', 'none');
                if(this.listInput.innerHTML === '') {
                    this.fillAvailableValues();
                }
                this.fillValDeferred.then(() => domStyle.set(this.listInput, 'display', ''));
                break;
            case false: 
                domStyle.set(this.valueTextBox, 'display', '');
                domStyle.set(this.listInput, 'display', 'none');
                break;
            }

        }))
    }

    private _getListMode = () => {
        const criteria = this.criteriaElement as any;
        return criteria.value === ' IN ' || criteria.value === ' NOT IN ';
    }

    private fillValDeferred = new Deferred();
    public fillAvailableValues = () : dojo.promise.Promise<any> => {
        // console.log("Layer", this.layer, this.layer.loaded);
        // console.log("Field", this.field);
        this.tool.showLoading();
        const _query = this.layer.createQuery();
        _query.where = "1=1";
        _query.outFields = [this.field.name];
        _query.orderByFields = [this.field.name];
        _query.returnDistinctValues = true;
        _query.returnGeometry = false;
        
        this.layer.queryFeatures(_query).then((results) => {
            // console.log("results", results);
            results.features.map((f: any) => {
                    // console.log("attributes", f.attributes[this.field.name], f.attributes)
                    return f.attributes[this.field.name];
                }).forEach((v) => {
                    if(v) {
                        this.listInput.innerHTML += `
                        <li>
                        <label role="presentation">
                            <input type="checkbox" class="checkbox" value="${v}"/>
                            <span>${v}</span>
                        </label>
                        </li>`;
                }
            });
            this.tool.hideLoading();
            this.fillValDeferred.resolve();
        });
        return this.fillValDeferred.promise;
    }

    public getFilterExpresion = () => {
        if(this._getListMode()) {
            const list = Array.prototype.slice.call(this.listInput.children).filter((c) => {
                var chbx = c.children[0].children[0];
                // console.log("c", c, chbx);
                return chbx.checked;
            }).map((k) => { 
                var chbx = k.children[0].children[0];
                // console.log("k", chbx, chbx.value);
                return chbx.value; 
            });
            if(!list || list.length === 0) 
            {
                return null;
            }
            else if(list.length == 1) {
                let op = " = ";
                if(this.criteriaElement.value.indexOf('NOT')>=0) {
                    op = " != ";
                }
                return `${this.field.name}${op}'${list[0]}'`;
            } else {
                let comma ="";
                const inList=list.reduce((previousValue:string, currentValue:string) => {
                    if(previousValue && previousValue!=='') 
                        comma = ", ";
                    return previousValue+"'"+comma+"'"+currentValue;
                });
                return `${this.field.name}${this.criteriaElement.value}('${inList}')`;
            }
        } else {
            if(this.valueTextBox.value !== '') {
                var text = this.valueTextBox.value;
                if(this.criteriaElement.value.indexOf('LIKE')>=0){
                    var re = /(.*%.*)|(.*_.*)|(\[.*\])/gm;
                    var matches = re.exec(text);
                    if(!matches || matches.length === 0) {
                        text += '%';
                    }
                }
                return this.field.name+this.criteriaElement.value+"'"+text+"'";
            }
            else {
                return null;
            }
        }
    }    

}

export = FilterString;
