/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import dom = require("dojo/dom");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");

@subclass("esri.widgets.FeaturesList")
  class FeaturesList extends declared(Widget) {
  
    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    tool: Tool;

    render() {
        return (
<ul id="featuresList" class="featuresList" afterCreate={this._addedList}/>
        );
    }

    constructor() {
        super();
    }

    private layers: __esri.Collection<__esri.Layer> = null

    private listElement: HTMLUListElement;
    private featureListCount: HTMLElement;

    private _addedList = (element:Element) => {
        this.listElement = element as HTMLUListElement;

        this.layers = this._getLayers();
        this.layers.forEach((l) => {
            const li = domConstruct.create("li", {
                innerHTML : l.id
            }, this.listElement);
        });

        const featureListHeader = dom.byId('pageHeader_features');
        this.featureListCount = domConstruct.create('div', {
            id: 'featureListCount',
            class:'fc bg',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            tabindex: 0,
            innerHTML: i18n.totalCount.format(0)
        },featureListHeader);


    }

    private _getLayers = () :  __esri.Collection<__esri.Layer> => {
        const ls = this.mapView.map.layers;
        const l1 = ls.filter((l) => { return l.hasOwnProperty("url");});
        const l2 = ls.filter((l) => { return !l.hasOwnProperty("url");});
        if(l2.length>0) {
            console.info("Feature List - These Layers are not services: ", l2);
        }
        return l1;
}


}

export = FeaturesList;
