/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
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

import FeatureListItem = require("./FeaturesListItem");

@subclass("esri.widgets.FeaturesList")
  class FeaturesList extends declared(Widget) {
  
    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    tool: Tool;

    @property()
    highlightSelect: any;

    render() {
        return (
<div>
    <ul id="featuresList" class="featuresList" afterCreate={this._addedList}/>
</div>
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

        const featureListHeader = dom.byId('pageHeader_features');
        this.featureListCount = domConstruct.create('div', {
            id: 'featureListCount',
            class:'fc bg',
            'aria-live': 'polite',
            'aria-atomic': 'true',
            tabindex: 0,
            innerHTML: i18n.totalCount.format(0)
        },featureListHeader);

        this._createList();
        this._reloadList(this.mapView.extent);
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

    public tasks = [];
    private _createList = () => {
        this.layers.forEach((layer: __esri.FeatureLayer) => {
            var _query = layer.createQuery();
            _query.outFields = ["*"];
            _query.returnGeometry = false;
            _query.spatialRelationship = "esriSpatialRelIntersects";
            
            this.tasks.push({
                layer : layer,
                query : _query
            });
        });

        this.mapView.watch("extent",(oldValue, newValue) => { this._reloadList(newValue); });
    }

    private _isVisible = () => {
        const page = dom.byId(this.id).closest('.page')[0];
        return domClass.contains(page, "showAttr");
    }

    private _clearMarker = () => {
        this.mapView.graphics.forEach((gr: any) => {
            if(gr.name && gr.name === 'featureMarker') {
                this.mapView.graphics.remove(gr);
            }
        });
    }

    private _reloadList = (ext) => {
        // if(!this._isVisible()) return;
        this.tool.showLoading();
        watchUtils.when(this.mapView, "stationary", () => {
            this.__reloadList(ext).then(() => {
                this.tool.hideLoading();
            });
        });
    }

    public _prevSelected: any;

    private __reloadList = (ext) => {
        const deferred = new Deferred();
        this.mapView.when(() => {

            console.log("__reloadList", ext, this.tasks);

            // this.tool.hideBadge(dom.byId('featureSelected'));

            const list = dom.byId('featuresList');
            // this._clearMarker();
            const promises = [];
            this.tasks
            .filter((t) => {
                const isVisibleAtScale = (layer : any) : boolean => {
                    return (layer.minScale <= 0 || this.mapView.scale <= layer.minScale) &&
                    (layer.maxScale <= 0 || this.mapView.scale >= layer.maxScale)
                } 
                return t.layer.popupEnabled && t.layer.visible && isVisibleAtScale(t.layer);
            })
            .forEach((t) => {
                t.query.geometry = ext.extent;
                try {
                    const exp = (t.layer as __esri.FeatureLayer).definitionExpression;
                    t.query.where = exp;

                    t.task = t.layer.queryFeatures(t.query);
                    promises.push(t.task);
                    t.task.then(result => {
                        t.result = result;
                        console.log("Features", t.layer.title, result.features)
                    })
                }
                catch (ex) {
                    // ignore
                    console.log("__reloadList", ex);
                }
            });

            let allFeatures = [];
            All(promises).then(() => {
                const results = this.tasks.filter((t : any) => t.result && t.result.features && t.result.features.length > 0);
                console.log("All", results);
                list.innerHTML = "";
                let count = 0;
                let preselected = null;

                if(results) results.forEach((result : any) => {
                    const layer = result.layer;
                    const features = result.result.features;
                    allFeatures = allFeatures.concat(features);
                    count += features.length;
                    // features.forEach((feature) => {
                    //     if(this._prevSelected && this._prevSelected.split('_')[1] == feature.attributes[layer.objectIdFieldName]) {
                    //         preselected = feature;
                    //     }
                    //     require(["../FeaturesList/FeaturesListItem"], (FeatureItem) => {
                    //         const li = domConstruct.create('li', {}, this.listElement);
                    //         const item = new FeatureItem({
                    //             feature: feature, 
                    //             featureList: this,
                    //             mapView: this.mapView,
                    //             container: li});
                    //     });
                    // });

                    // // features.array.forEach(feature => {

                    // //     const li = domConstruct.create("li", {}, list);
                    // //     const featureListItem = this._getFeatureListItem(i, feature, layer.objectIdFieldName, layer, li);
                    // //     //  if(featureListItem)
                    // //     //  {
                    // //     //      const li = domConstruct.create("li", {
                    // //     //          // tabindex : 0,
                    // //     //          innerHTML : featureListItem
                    // //     //      }, list);
                    // //     // }                    
                    // // });
                });
                dom.byId('featureListCount').innerHTML = i18n.totalCount.format(allFeatures.length);
                const popup = this.mapView.popup as any;
                // popup.autoOpenEnabled = false;
                popup.clear();
                setTimeout(() => {
                    popup.features = allFeatures;
                    setTimeout(() => {
                        const featureWidgets = popup.featureWidgets;
                        console.log("popup", popup, featureWidgets);

                        for(let i = 0; i< featureWidgets.length; i++) {
                            const featureWidget = featureWidgets[i];
                            console.log("feature", this.mapView.popup.features[i]);

                            require(["../FeaturesList/FeaturesListItem"], (FeatureItem) => {
                                new FeatureItem({
                                    mapView: this.mapView,
                                    featureIndex: i,
                                    featureWidget: featureWidget,
                                    feature: this.mapView.popup.features[i], 
                                    featureList: this,
                                    container: domConstruct.create('li', {}, this.listElement)
                                });
                            });
                        };
                    }, 250);
                }, 250);

            })

            deferred.resolve(true);
        });

        return deferred.promise;
    }

}

export = FeaturesList;
