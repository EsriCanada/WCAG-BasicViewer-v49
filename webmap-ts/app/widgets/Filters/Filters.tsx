/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { tsx } from "esri/widgets/support/widget";


@subclass("esri.widgets.Filters")
  class Filters extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;

    @property()
    tool: any;

    constructor() {
        super();
    }

    render() {
        return (
            <div>
            <div id="filterTabsContent" class="filterTabsContent"></div>
            <div class="filterTabsZone" afterCreate={this._addFilters}></div>
            </div>
        );
    }

    private layers: __esri.Collection<__esri.Layer> = null

    private _addFilters = (element: Element) => {
        this.mainView.when((mapView) => {
            this.layers = mapView.map.layers;

            // const filterTabsZone = domConstruct.create("div", {
            //     class: "filterTabsZone"
            // }, element);
            require(["./filterTab"], (FilterTab) => { 
                this.layers.forEach((layer, i) => {
                    if((layer as __esri.FeatureLayer).popupTemplate)
                    new FilterTab({ 
                        layer: layer, 
                        // id: `FilterTab_${i}`, 
                        tool : this.tool,

                        container: element
                    });
                })
            })
        });
    }
}


export = Filters;
