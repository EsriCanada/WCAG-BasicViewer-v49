/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { ApplicationConfig } from "ApplicationBase/interfaces";

import BasemapGallery = require("esri/widgets/BasemapGallery");
import PortalBasemapsSource = require("esri/widgets/BasemapGallery/support/PortalBasemapsSource");

import dom = require("dojo/dom");
import domClass = require("dojo/dom-class");
import on = require("dojo/on");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import watchUtils = require("esri/core/watchUtils");
import { isConstructSignatureDeclaration } from "typescript";

@subclass("esri.widgets.ReadVectorMap")
  class ReadVectorMap extends declared(Widget) {
  
    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    title: string;

    @property()
    content: string;

    
    render() {
        return (
<div>
    <div afterCreate={this._addedNode}>
    <div>{this.title}</div>
    <div>{this.content}</div>
    </div>
</div>
        );
    }

    private _addedNode = (element: Element) => {
    }

}

export = ReadVectorMap;
