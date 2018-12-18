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

@subclass("esri.widgets.FilterNumber")
  class FilterNumber extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    render() {
      const id1 ="id1";
      const id2 = "id2";
      const format = "";
      return(
<div class="_filter _number">
	<select autofocus tabindex="0" 
		data-dojo-attach-event="onchange: criteriaChanged"
		data-dojo-attach-point="criteria"
		class="filter-filterItem__Criteria"
		>
		<option value=" = ">{i18n.FilterItem.equal}</option>			
		<option value=" != ">{i18n.FilterItem.notEqual}</option>
		<option value=" < ">{i18n.FilterItem.lessThen}</option>
		<option value=" > ">{i18n.FilterItem.moreThen}</option>
		<option value=" BETWEEN ">{i18n.FilterItem.between}</option>
		<option value=" NOT BETWEEN ">{i18n.FilterItem.notBetween}</option>			
	</select>
	<input type="textbox" 
    id={id1}
    class="filter-filterItem__textBox--number"
    data-dojo-attach-point="minValue" 
    aria-label={i18n.FilterItem.enterValueToMatch}
    title={i18n.FilterItem.enterValueToMatch}
    data-dojo-type="dijit/form/ValidationTextBox"
    data-dojo-props="regExp:'{format}', invalidMessage:'{i18n.FilterItem.invalidNumber}',
    missingMessage:'{i18n.FilterItem.enterValueToMatch}'"
    required='true'/>
	<div style="display:none;" data-dojo-attach-point="divMaxValue">
		<input type="textbox" 
		id={id2}
		data-dojo-attach-point="maxValue" 
		aria-label={i18n.FilterItem.enterLastValue}
		title={i18n.FilterItem.enterLastValue}
		data-dojo-type="dijit/form/ValidationTextBox"
	    data-dojo-props="regExp:'{format}', invalidMessage:'{i18n.FilterItem.invalidNumber}',
    	missingMessage:'{i18n.FilterItem.enterLastValue}'"
    	required='true'/>
	</div>
	<div class='showErrors' style="display:none;"></div>
</div>

      )
    }
  }

  export = FilterNumber;
