/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import dom = require("dojo/dom");
import query = require("dojo/query");
import domClass = require("dojo/dom-class");
import on = require("dojo/on");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");

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
        // this.layers.forEach((l) => {
        //     const li = domConstruct.create("li", {
        //         innerHTML : l.id
        //     }, this.listElement);
        // });

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

    private tasks = [];
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

        // this.own(on(this.mapView, "extent-change", this._reloadList));
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
        this.__reloadList(ext).then((results) => {
            this.tool.hideLoading();
        });
    }

    private _prevSelected: any;

    private __reloadList = (ext) => {
        const deferred = new Deferred();

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
            return t.layer.visible && isVisibleAtScale(t.layer) && t.layer.popupTemplate;
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

        All(promises).then(() => {
            const results = this.tasks.filter((t : any) => t.result && t.result.features && t.result.features.length > 0);
            console.log("All", results);
            list.innerHTML = "";
            let count = 0;
            let preselected = null;

            if(results) results.forEach((result : any) => {
                const layer = result.layer;
                const features = result.result.features;
                count += features.length;
                features.array.forEach((feature) => {
                });

                // features.array.forEach(feature => {
                //     if(this._prevSelected && this._prevSelected.split('_')[1] == feature.attributes[layer.objectIdFieldName]) {
                //         preselected = feature;
                //     }

                //     const li = domConstruct.create("li", {}, list);
                //     const featureListItem = this._getFeatureListItem(i, feature, layer.objectIdFieldName, layer, li);
                //     //  if(featureListItem)
                //     //  {
                //     //      const li = domConstruct.create("li", {
                //     //          // tabindex : 0,
                //     //          innerHTML : featureListItem
                //     //      }, list);
                //     // }                    
                // });
            });
            dom.byId('featureListCount').innerHTML = i18n.totalCount.format(count);

            // for(let i = 0; i<results.length; i++)
            // {
            //     const layer = this.tasks[i].layer;
            //     if(layer.visible && layer.visibleAtMapScale && layer.infoTemplate) {
            //         const result = results[i];

            //         if(result) {
            //             console.log("result", result);
            //             // count += result.features.length;
            //             // for(let j = 0; j<result.features.length; j++) {
            //             //     const resultFeature = result.features[j];
            //             //     if(this._prevSelected && this._prevSelected.split('_')[1] == resultFeature.attributes[result.objectIdFieldName]) {
            //             //         preselected = resultFeature;
            //             //     }

            //             //     const li = domConstruct.create("li", {}, list);
            //             //     const featureListItem = this._getFeatureListItem(i, resultFeature, result.objectIdFieldName, layer, li);
            //             //    //  if(featureListItem)
            //             //    //  {
            //             //    //      const li = domConstruct.create("li", {
            //             //    //          // tabindex : 0,
            //             //    //          innerHTML : featureListItem
            //             //    //      }, list);
            //             //    // }
            //             // }
            //         }
            //     }
            // }
            // if(!preselected) {
            //     this._prevSelected = null;
            // } else {
            //     const checkbox = dom.byId("featureButton_"+this._prevSelected) as HTMLInputElement;
            //     if(checkbox) {
            //         checkbox.checked = true;
            //         const featureItem = checkbox.closest('.featureItem')[0];
            //         // const w = dijit.byId(featureItem.id);
            //         // w._featureExpand(checkbox, true);
            //         checkbox.focus();
            //     }
            // }


            deferred.resolve(true);
        });

        return deferred.promise;
    }

}

export = FeaturesList;
