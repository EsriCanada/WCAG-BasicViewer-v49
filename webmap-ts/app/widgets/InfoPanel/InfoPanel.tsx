/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.InfoPanel")
  class InfoPanel extends declared(Widget) {
  
    @property()
    mapView: __esri.MapView | __esri.SceneView;

    constructor() {
        super();
    }

    render() {
        return (
    <div afterCreate={this._addInfoPanel}>Info Panel</div>
        );
    }

    private infoPanelElement : HTMLDivElement;
    private _addInfoPanel = (element: Element) => {
        this.infoPanelElement = element as HTMLDivElement;
    }
     
}


export = InfoPanel;