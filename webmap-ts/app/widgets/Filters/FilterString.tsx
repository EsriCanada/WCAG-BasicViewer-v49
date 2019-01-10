/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

// import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
// import lang = require("dojo/_base/lang");
// import domConstruct = require("dojo/dom-construct");
// import query = require("dojo/query");
// import dom = require("dojo/dom");
import on = require("dojo/on");
// import domAttr = require("dojo/dom-attr");
// import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.FilterString")
  class FilterString extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

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

    private valueTextBox: Element;
    private listInput: Element;

    private _addedTextBox = (element : Element) => {
        this.valueTextBox = element;
    }

    private _addedListInput = (element : Element) => {
        this.listInput = element;
    }

    private criteriaElement: Element;
    private _criteriaCreated = (element:Element) => {
      this.criteriaElement = element;
      this.own(on(element, "change", (event) => { 
        switch(this._getListMode()) {
          case true: 
            domStyle.set(this.valueTextBox,'display', 'none');
            domStyle.set(this.listInput,'display', '');
            if(this.listInput.innerHTML === '') {
                this.getFilterExpresion();
            }
            break;
          case false: 
            domStyle.set(this.valueTextBox,'display', '');
            domStyle.set(this.listInput,'display', 'none');
            break;
        }

      }))
    }

    private _getListMode = () => {
      const criteria = this.criteriaElement as any;
      return criteria.value === ' IN ' || criteria.value === ' NOT IN ';
    }

    public getFilterExpresion = () => {
        // console.log("Layer", this.layer, this.layer.loaded);
        // console.log("Field", this.field);
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
                        <input type="checkbox" class="checkbox" value=${v}/>
                        <span>${v}</span>
                    </label>
                    </li>`;
                }
            });
        });
    }
}

export = FilterString;
