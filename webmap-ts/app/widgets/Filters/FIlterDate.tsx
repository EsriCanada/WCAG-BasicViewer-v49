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

    // private MyDateTextBox: any;

    // constructor() {
    //     super();
    //     require(["dojo/_base/declare", "dijit/form/DateTextBox", "dojo/date/locale", "dojo/dom", "dojo/domReady!"],
    //     (declare, DateTextBox, locale, dom) => {
    //         declare("MyDateTextBox", DateTextBox, {
    //             myFormat: {selector: 'date', datePattern: 'dd-MMM-yyyy', locale: 'en-us'},
    //             value: "", // prevent parser from trying to convert to Date object
    //             postMixInProperties: function() { // change value string to Date object
    //                 this.inherited(arguments);
    //                 // convert value to Date object
    //                 this.value = locale.parse(this.value, this.myFormat);
    //             }                
    //         this.MyDateTextBox = MyDateTextBox;
    //         });  
    //     })  
    // }

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
        aria-label={i18n.FilterItem.enterValueToMatch}
        title={i18n.FilterItem.enterValueToMatch}
        afterCreate={this._addedMinValue}
        // data-dojo-props=
        // `invalidMessage:{i18n.FilterItem.invalidDate},
        // missingMessage:{i18n.FilterItem.enterDateToMatch}`
        required="true"/>
    <div class="filter-filterDate__grid-item"/>

	<input type="text" 
        // id={id2}
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
    private minValueWig: any = null;
    private maxValueWig: any = null;

    private dateOptions = {trim: true, fullYear: false, locale: ""};
    private _prepareDateWig = (wig : any, date: Date, required: boolean = false) : void => {
        wig.constraints.fullYear = false;
        wig.messages.invalidMessage = i18n.FilterItem.invalidDate;
        wig.messages.missingMessage = i18n.FilterItem.missingDate;
        wig.messages.rangeMessage = i18n.FilterItem.rangeErrorDate;
        wig.startup();
        wig.set('value', date);
        console.log('wigDate', wig);
    }

    private _addedMinValue = (element : Element) => {
        this.minValue = element;
        require(["dijit/form/DateTextBox", "dojo/date/locale", "dojo/domReady!"],
        (DateTextBox, locale) => {
            this.dateOptions.locale = locale;
            this.minValueWig = new DateTextBox(this.dateOptions, element);
            this._prepareDateWig(this.minValueWig, new Date(2018, 2, 10));
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
                            this._prepareDateWig(this.maxValueWig, new Date(2019, 2, 10));
                        })
                    } else {
                        domStyle.set(this.maxValueWig.domNode,'display', '');
                    }
                    break;
                case false: 
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
