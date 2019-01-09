/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
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
// import { NormalizeTitle } from "../../utils";

@subclass("esri.widgets.FilterNumber")
  class FilterNumber extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    private minValueNode: Element;
    private maxValueNode: Element;

    render() {
      const id1 ="id1";
      const id2 = "id2";
      const format = "";
      return(
<div>
  <select autofocus tabindex="0" 
    afterCreate={this._criteriaCreated}
    class="filter-filterItem__Criteria"
    aria-label={i18n.FilterItem.selectCriteria}
		>
		<option value=" = ">{i18n.FilterItem.equal}</option>			
		<option value=" != ">{i18n.FilterItem.notEqual}</option>
		<option value=" < ">{i18n.FilterItem.lessThen}</option>
		<option value=" > ">{i18n.FilterItem.moreThen}</option>
		<option value=" BETWEEN ">{i18n.FilterItem.between}</option>
		<option value=" NOT BETWEEN ">{i18n.FilterItem.notBetween}</option>			
	</select>
	<input type="number"
    class="filter-filterItem__textBox--number"
    afterCreate={this._addedMinValue}
    aria-label={i18n.FilterItem.enterValueToMatch}
    title={i18n.FilterItem.enterValueToMatch}
    />
  <input type="number"
    class="filter-filterItem__textBox--number"
    style="display: none;"
    afterCreate={this._addedMaxValue}
		aria-label={i18n.FilterItem.enterLastValue}
		title={i18n.FilterItem.enterLastValue}
    />
</div>
      )
    }

    private _addedMinValue = (element:Element) => {
      this.minValueNode = element;
    }

    private _addedMaxValue = (element:Element) => {
      this.maxValueNode = element;
    }

    private criteriaElement: Element;
    private _criteriaCreated = (element:Element) => {
      this.criteriaElement = element;
      this.own(on(element, "change", (event) => { 
        switch(this._getBetweenMode()) {
          case false: 
              domStyle.set(this.maxValueNode,'display', 'none');
              break;
          case true: 
              domStyle.set(this.maxValueNode,'display', '');
              break;
      }

      }))
    }

    private _getBetweenMode = () => {
      const criteria = this.criteriaElement as any;
      return criteria.value === ' BETWEEN ' || criteria.value === ' NOT BETWEEN ';
    }

    public getFilterExpresion = () => {
      if(this._getBetweenMode()) {
          const minNumb = (this.minValueNode as any).value;
          const maxNumb = (this.maxValueNode as any).value;
          if(minNumb && maxNumb) {
            const where = `${this.field.name}${(this.criteriaElement as any).value}'${minNumb}' AND '${maxNumb}'`;
            //console.log(where);
            return where;
          }
          else {
            return null;
          }
      } else {
        const numb = (this.minValueNode as any).value;
        if(numb) {
          const where = `${this.field.name}${(this.criteriaElement as any).value}'${numb}'`;
          //console.log(where1);
          return where;
        }
        else {
          return null;
        }
      }
  }    
  }

  export = FilterNumber;
