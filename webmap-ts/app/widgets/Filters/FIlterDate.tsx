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

@subclass("esri.widgets.FilterDate")
  class FilterDate extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    render() {
      return(
<div class="filter-filterDate__grid-container">
    <select autofocus tabindex="0" 
        afterCreate={this._criteriaCreated}
        class="filter-filterItem__Criteria filter-filterDate__grid-item filter-filterDate__grid-item--Criteria"
        aria-label={i18n.FilterItem.selectCriteria}
		>
		<option value=" = ">{i18n.FilterItem.equal}</option>
		<option value=" != ">{i18n.FilterItem.notEqual}</option>
		<option value=" < ">{i18n.FilterItem.lessThen}</option>
		<option value=" > ">{i18n.FilterItem.moreThen}</option>	
		<option value=" BETWEEN ">{i18n.FilterItem.between}</option>
		<option value=" NOT BETWEEN ">{i18n.FilterItem.notBetween}</option>		
    </select>
	<input type="text" 
        // id={id1}
        class="filter-filterDate__grid-item"
        data-dojo-attach-point="minValue" 
        data-dojo-type="dijit/form/DateTextBox" 
        aria-label={i18n.FilterItem.enterValueToMatch}
        title={i18n.FilterItem.enterValueToMatch}
        afterCreate={this._addedMinValue}
        // data-dojo-props=
        // `invalidMessage:{i18n.FilterItem.invalidDate},
        // missingMessage:{i18n.FilterItem.enterDateToMatch}`
        required="true"/>
	<input type="text" 
        // id={id2}
        data-dojo-attach-point="maxValue" 
        data-dojo-type="dijit/form/DateTextBox" 
        aria-label={i18n.FilterItem.enterLastValue}
        title={i18n.FilterItem.enterLastValue}
        afterCreate={this._addedMaxValue}
        style="display:none;" 
        class="filter-filterDate__grid-item"
        // data-dojo-props=`invalidMessage:{i18n.FilterItem.invalidDate}, missingMessage:{i18n.widgets.FilterItem.enterLastDate}`
        required="true"/>

	<div class='showErrors' style="display:none;"></div>
</div>
      )
    }

    private minValue: Element;
    private maxValue: Element;

    private _addedMinValue = (element : Element) => {
        this.minValue = element;
    }

    private _addedMaxValue = (element : Element) => {
        this.maxValue = element;
    }

    private criteriaElement: Element;
    private _criteriaCreated = (element:Element) => {
      this.criteriaElement = element;
      this.own(on(element, "change", (event) => { 
        switch(this._getBetweenMode()) {
          case true: 
            domStyle.set(this.maxValue,'display', '');
            break;
          case false: 
            domStyle.set(this.maxValue,'display', 'none');
            break;
        }

      }))
    }

    private _getBetweenMode = () => {
        const criteria = this.criteriaElement as any;
        return criteria.value === ' BETWEEN ' || criteria.value === ' NOT BETWEEN ';
    }

    public getFilterExpresion = () => {
        // // console.log("Layer", this.layer, this.layer.loaded);
        // // console.log("Field", this.field);
        // const _query = this.layer.createQuery();
        // _query.where = "1=1";
        // _query.outFields = [this.field.name];
        // _query.orderByFields = [this.field.name];
        // _query.returnDistinctValues = true;
        // _query.returnGeometry = false;
        
        // this.layer.queryFeatures(_query).then((results) => {
        //     // console.log("results", results);
        //     results.features.map((f: any) => {
        //             // console.log("attributes", f.attributes[this.field.name], f.attributes)
        //             return f.attributes[this.field.name];
        //         }).forEach((v) => {
        //         if(v) {
        //             this.listInput.innerHTML += `
        //             <li>
        //             <label role="presentation">
        //                 <input type="checkbox" class="checkbox" value=${v}/>
        //                 <span>${v}</span>
        //             </label>
        //             </li>`;
        //         }
        //     });
        // });
    }
}

export = FilterDate;
