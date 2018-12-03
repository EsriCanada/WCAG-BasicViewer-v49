/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
// import * as Promise from 'lib';

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.MyOverviewMap")
  class MyOverviewMap extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    // @property()
    // myToolPage : ToolPage;

    // @property()
    // @renderable()
    // active: boolean;
  
    constructor() {
        super();
    }
            
    render() {
        return (
        <div 
            afterCreate={this._addOverviewMap} 
            // afterUpdate={this._updateTool} 
            >
        </div>
        );
    }

    private _addOverviewMap = (element: Element) => {
        // console.log(this.tool, this.config);
    }
}

export = MyOverviewMap;


