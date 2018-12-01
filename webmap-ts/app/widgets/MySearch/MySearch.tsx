/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");
import on = require("dojo/on");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
// import { Has, isNullOrWhiteSpace } from "../../utils";

@subclass("esri.widgets.Search")
class Search extends declared(Widget) {

    @property()
    config: ApplicationConfig;

    @property()
    mapView: __esri.MapView | __esri.SceneView;

    render() {
        return (
            <div afterCreate={this._addSearch}>
            </div>
        );
    }

    private _addSearch = (element:Element) => {
        require(["esri/widgets/Search"], lang.hitch(this, function(Search) {
            document.getElementById("searchLabel").innerHTML = i18n.search;
            const searchWidget = new Search({
              view: this.mapView,
              container: domConstruct.create("div",{},element)
            });
            console.log("Search", searchWidget)
          }));
    }

}

export = Search;
