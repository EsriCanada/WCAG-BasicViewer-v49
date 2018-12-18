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

@subclass("esri.widgets.FilterItem")
  class FilterItem extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    constructor() {
        super();
    }

    // private field_label: string = "field_label";
    // private Id: string = "id";

    render() {
        return (
            <div>
            <li tabindex="0">
                <div class="filter-filterItem--header">
                    <label class="checkbox">
                        <input 
                            // id="Active_{this.field_label}_{this.Id}"
                            type="checkbox" 
                            class="checkbox" 
                            checked 
                            aria-label="Active" 
                            title="Active" 
                            data-dojo-attach-point="Active"/> 
                        {NormalizeTitle(this.field.alias)}
                    </label>
                    <button role="button" aria-label="remove" title="remove" class="esri-widget--button esri-icon-minus filter-filterItem__button"></button>
                </div>
                <div data-dojo-attach-point="content"/>
            </li>
            </div>
        );
    }

  }

export = FilterItem;