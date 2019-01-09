/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

// import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
// import domConstruct = require("dojo/dom-construct");
// import query = require("dojo/query");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
// import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import { isNullOrUndefined } from "util";

@subclass("esri.widgets.FilterDate")
  class FilterDate extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    @property()
    showErrors: (err: string) => {};

    private minDate: Date;
    private maxDate: Date;

    constructor() {
        super();
        const year = new Date().getFullYear()-1;
        this.minDate = new Date(year, 0, 1);
        this.maxDate = new Date(year, 11, 31);
    }

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
    <div 
        class="filter-filterDate__grid-item"
        afterCreate={this._addedMinValue}
        />
    <div class="filter-filterDate__grid-item"/>

    <div 
        afterCreate={this._addedMaxValue}
        style="display:none;" 
        class="filter-filterDate__grid-item"
        />
</div>
      )
    }

    private minValue: Element;
    private maxValue: Element;
    private minValueWig: any = null;
    private maxValueWig: any = null;

    private dateOptions = {trim: true, fullYear: false, locale: ""};
    private _prepareDateWig = (wig : any, date: Date, required: boolean = false) : void => {
        // wig.constraints.fullYear = false;
        wig.messages.invalidMessage = i18n.FilterItem.invalidDate;
        wig.messages.missingMessage = i18n.FilterItem.missingDate;
        wig.messages.rangeMessage = i18n.FilterItem.rangeErrorDate;
        wig.required = required;
        domAttr.set(wig.textbox,"aria-label",i18n.FilterItem.enterValueToMatch);
        // domAttr.set(wig.textbox,"title",i18n.FilterItem.enterValueToMatch);
        domAttr.set(wig.textbox,"placeHolder",i18n.FilterItem.enterValueToMatch);
        // wig.constraints.max = new Date(Date.now());
        // wig.openOnClick = true; // ?
        wig.startup();
        wig.set('value', date);
        // console.log('wigDate', wig);
    }

    private minChangeHandler;
    private maxChangeHandler;
    private restrictRange = (date) => {
        // console.log("restrictRange", date);
        // if(!this.minValueWig || !this.maxValueWig) return;
        this.minValueWig.constraints.max = date ? this.maxValueWig.value : new Date(2900, 1, 1);
        this.maxValueWig.constraints.min = date ? this.minValueWig.value : new Date(1900, 1, 1);
        this.minValueWig.set('value', this.minValueWig.get('value'));
        this.maxValueWig.set('value', this.maxValueWig.get('value'));
        // console.log("range", this.maxValueWig.constraints.min, " - ", this.minValueWig.constraints.max);
    }

    private showError = (err: string): void => {
        // console.log("showError", err);
        this.showErrors(err);
    }

    private _addedMinValue = (element : Element) => {
        this.minValue = element;
        require(["dijit/form/DateTextBox", "dojo/date/locale", "dojo/domReady!"],
        (DateTextBox, locale) => {
            this.dateOptions.locale = locale;
            this.minValueWig = new DateTextBox(this.dateOptions, element);
            this._prepareDateWig(this.minValueWig, this.minDate, true);
            this.minChangeHandler = on.pausable(this.minValueWig, "change", this.restrictRange);
            this.minChangeHandler.pause();
            this.own(this.minChangeHandler);

            this.minValueWig.displayMessage = this.showError;
        })
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
                    // console.log("this.maxValue", this.maxValue);
                    if(!this.maxValueWig) {
                        domStyle.set(this.maxValue, 'display', '');
                        require(["dijit/form/DateTextBox", "dojo/date/locale", "dojo/domReady!"],
                        (DateTextBox, locale) => {
                            this.maxValueWig = new DateTextBox(this.dateOptions, this.maxValue);
                            this._prepareDateWig(this.maxValueWig, this.maxDate, true);
                            this.maxChangeHandler = on.pausable(this.maxValueWig, "change", this.restrictRange);
                            this.maxChangeHandler.pause();
                            this.own(this.maxChangeHandler);

                            this.maxValueWig.displayMessage = this.showError;
                        });
                        this.minChangeHandler.resume();
                    } else {
                        domStyle.set(this.maxValueWig.domNode,'display', '');
                    }
                    this.maxValueWig.required = true;
                    this.minChangeHandler.resume();
                    this.maxChangeHandler.resume();
                    this.restrictRange(this.maxValueWig.value);
                    break;
                case false: 
                    this.maxValueWig.required = false;
                    this.minChangeHandler.pause();
                    this.maxChangeHandler.pause();
                    this.restrictRange(null);
                    domStyle.set(this.maxValueWig.domNode,'display', 'none');
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
