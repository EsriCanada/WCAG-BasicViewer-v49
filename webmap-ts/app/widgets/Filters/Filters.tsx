/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import dom = require("dojo/dom");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");

@subclass("esri.widgets.Filters")
  class Filters extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;

    @property()
    tool: Tool;
    
    private filterTabs = {};

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

    private filtersOn = new Array();

    public ShowFiltersOn = (id:string) => {
        if(!this.filtersOn.some((f) => f === id)) {
            this.filtersOn.push(id);
            this.tool.showBadge(dom.byId("badge_someFilters"));
        }
    }

    public HideFiltersOn = (id:string) => {
        if(this.filtersOn.some((f) => f === id)) {
            this.filtersOn.splice(this.filtersOn.indexOf(id),1);
            if(this.filtersOn.length === 0) {
                this.tool.hideBadge(dom.byId("badge_someFilters"));
            }
        }
    }


    public AddFilterItem(layer, fieldName, value) {
        const filterTab = this.filterTabs[layer.id];
        filterTab._filterAdd(fieldName, value);
    }

    private _addFilters = (element: Element) => {
        this.mainView.when((mapView) => {
            const layers = mapView.map.layers;

            require(["./filterTab"], (FilterTab) => { 
                layers.forEach((layer, i) => {
                    if((layer as __esri.FeatureLayer).popupTemplate)
                    this.filterTabs[layer.id] = new FilterTab({ 
                        filters: this,
                        mapView: this.mainView,
                        layer: layer, 
                        tool : this.tool,
                        container: element
                    });
                })
            })
        });
    }
}


export = Filters;
