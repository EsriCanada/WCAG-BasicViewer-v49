/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
// import * as Promise from 'lib';

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

@subclass("esri.widgets.FilterTab")
  class FilterTab extends declared(Widget) {
    @property()
    layer: __esri.Layer;

    constructor() {
        super();
    }

    render() {
        return (
            <div>
            <div afterCreate={this._addFilterTab}>{NormalizeTitle(this.layer.title)}</div>
            </div>
        );
    }

    private _addFilterTab = (elemenet: Element) => {
        console.log("layer", this.layer.title);
    }
}

export = FilterTab;
