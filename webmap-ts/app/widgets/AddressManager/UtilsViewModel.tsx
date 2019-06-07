/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import Accessor = require("esri/core/Accessor");

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import MapView = require("esri/views/MapView");
import Deferred = require("dojo/Deferred");
import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import Draw = require("esri/views/draw/Draw");
import geometryEngine = require("esri/geometry/geometryEngine");
import lang = require("dojo/_base/lang");
import html = require("dojo/_base/html");
import Query = require("esri/tasks/support/Query");

@subclass("esri.guide.UtilsViewModel")
class UtilsViewModel extends declared(Accessor) {

    @property()
    mapView: MapView;

    @property()
    roadsLayer: FeatureLayer;

    // @property({ aliasOf: "mapView.map" })
    // map: Map;

    @property({ readOnly: true })
    BUFFER_SYMBOL = {
        type:"simple-fill",
        color: [255, 0, 0, 0.35],
        outline: {
            color:"transparent",
            width:0,
            style:"solid"
        }
    }

    @property({ readOnly: true })
    ADDRESS_ROAD_BUFFER_SYMBOL = {
        type:"simple-fill",
        color: [255, 30, 30, 0],
        style: "solid",
        outline: {
            color: [255, 30, 30, 0.5],
            width: 2,
            type: "simple-line",
            style: "solid"
        }
    }

    @property({ readOnly: true })
    SELECTED_ADDRESS_SYMBOL = {
        name: "SELECTED_ADDRESS_SYMBOL",
        type:"simple-marker",
        style: "circle",
        color: [255, 30, 30, 0],
        size: 10,
        outline: {
            color: [255, 30, 39, 1],
            width: 1,
            type: "simple-line",
            style: "solid"
        }
    }

    @property({ readOnly: true })
    NEW_ADDRESS_SYMBOL = {
        name: "NEW_ADDRESS_SYMBOL",
        type:"simple-marker",
        style: "circle",
        color: [255, 30, 30, 0],
        size: 7,
        outline: {
            color: [0, 0, 0, 1],
            width: 1,
        }
    }

    @property({ readOnly: true })
    SELECTED_PARCEL_SYMBOL = {
        type:"simple-fill",
        color: [0, 0, 0, 0],
        outline: {
            color: [255, 30, 30, 255],
            width: 2,
            type: "simple-line",
            style: "short-dot"
        }
    }
        
    @property({ readOnly: true })
    SELECTED_ROAD_SYMBOL = {
        color: [255, 30, 30, 255],
    }
        
    LABEL_SYMBOL = function(labelText?: string) {
        const symb = {
            type: "text",
            text: labelText,
            color:[0, 0, 0, 255],
            haloColor:[255, 200, 200, 255],
            haloSize:1,
            horizontalAlignment: "center",
            xoffset:0,
            yoffset: -22,
            font: {
                family : "'Avenir Light', Verdana, Geneva, sans-serif",
                size: "12px",
                weight: "bold"
            }
        };
        (symb as any).name = "Label";
        return symb;
    }

    SHOW_POINT = function(point, color, graphicsLayer: GraphicsLayer) {
        const symbol = {
            color: [255, 255, 255, 255],
            size: 5,
            type: "simple-marker",
            style: "circle",
            outline: {
                color: color,
                width: 2,
                style: "solid"
            }
        }

        graphicsLayer.graphics.add({geometry: point, symbol:symbol} as any);
    }
    
    PICK_ROAD_sketchVM: SketchViewModel = null;

    PICK_ROAD = function()  {
        const deferred = new Deferred();
        // this.mapView.popup.autoOpenEnabled = false; // ?
        this.mapView.popup.close();

        // let drawDrawEnd = draw.on("draw-complete", lang.hitch(this, pickRoad));
        // draw.activate(Draw.POINT);
        const tempGraphicsLayer = new GraphicsLayer();

        this.mapView.map.add(tempGraphicsLayer); 

        if(!this.PICK_ROAD_sketchVM) {
            this.PICK_ROAD_sketchVM = new SketchViewModel({
                layer: tempGraphicsLayer,
                view: this.mapView,
            })
        }
        if (this.PICK_ROAD_sketchVM.state == "active") {
            this.PICK_ROAD_sketchVM.cancel();
            deferred.cancel("User Cancel");
            setTimeout(() => { this.mapView.graphics.removeAll(); }, 250);
            return deferred.promise;
        }

        this.PICK_ROAD_sketchVM.create("point");
        this.PICK_ROAD_sketchVM.on("create", lang.hitch(this, function(event) {
            
            if (event.state === "complete") {
                const graphic = event.graphic;
                // console.log("event.graphic", event.graphic);

                // sketchVM.layer.remove(graphic);
                // mapView.graphics.add(graphic);

                // tempGraphicsLayer.destroy();
                tempGraphicsLayer.removeAll();

                const buffer = geometryEngine.buffer(graphic.geometry, 5, "meters");
    
                const gr = { 
                    geometry: buffer, 
                    symbol: this.BUFFER_SYMBOL
                };
                // console.log("gr", gr);

                this.mapView.graphics.add(gr);
          
                const q = this.roadsLayer.createQuery();
                q.outFields = ["*"];
                q.where = "1=1";
                q.geometry = buffer as any;
                q.spatialRelationship = "intersects";
                q.returnGeometry = true;
        
                this.roadsLayer.queryFeatures(q).then(
                    lang.hitch(this, function(results) {
                        const roads = results.features;
                        if (roads.length == 1) {
                            const roadMarker = geometryEngine.buffer(roads[0].geometry, 2.5, "meters");
                            const roadGraphic = { geometry: roadMarker, symbol: this.BUFFER_SYMBOL, attributes: roads[0].attributes};
                            // 
                            setTimeout(() => { this.mapView.graphics.removeAll(); }, 250);
                            deferred.resolve(roads[0]);
                        } else {
                            setTimeout(() =>  { this.mapView.graphics.removeAll(); }, 250);
                            deferred.cancel("Too many or no matches")
                        }
                    }),
                    error => {
                        // console.error("PICK_ROAD", error);
                        deferred.cancel(error);
                        setTimeout(() => { this.mapView.graphics.removeAll(); }, 250);
                    }
                );

            }

        }));

       return deferred.promise;
    }

    ADD_NEW_ADDRESS_sketchVM: SketchViewModel = null;
    
    ADD_NEW_ADDRESS = function() {
        const deferred = new Deferred();
        // this.mapView.popup.autoOpenEnabled = false; // ?
        this.mapView.popup.close();

        if(!this.addressGraphicsLayer) {
            this.addressGraphicsLayer = new GraphicsLayer();

            this.mapView.map.add(this.addressGraphicsLayer);
        }

        if(!this.ADD_NEW_ADDRESS_sketchVM) {
            this.ADD_NEW_ADDRESS_sketchVM = new SketchViewModel({
            layer: this.addressGraphicsLayer,
            view: this.mapView,
            pointSymbol: this.NEW_ADDRESS_SYMBOL
          })
        }
        if (this.ADD_NEW_ADDRESS_sketchVM.state == "active") {
            this.ADD_NEW_ADDRESS_sketchVM.cancel();
            deferred.cancel("User Cancel");
            // setTimeout(() => { this.mapView.graphics.removeAll(); }, 250);
            return deferred.promise;
        }
        this.ADD_NEW_ADDRESS_sketchVM.create("point");
        this.ADD_NEW_ADDRESS_sketchVM.on("create", lang.hitch(this, function(event) {
            if (event.state === "complete") {
                const feature = event.graphic;
                feature.attributes = { "status": 0 };
                feature.Dirty = true;
                // console.log("feature", event, feature);

                deferred.resolve(feature);
            }
        }));

        return deferred.promise;
    }

    PICK_ADDRESS_FROM_PARCEL_RANGE_draw: Draw = null;
    
    PICK_ADDRESS_FROM_PARCEL_RANGE = (addressLayer, parcelLayer) => {
        const deferred = new Deferred();
        // this.mapView.popup.autoOpenEnabled = false; // ?
        this.mapView.popup.close();

        if(!this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw) {
            this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw = new Draw({
            view: this.mapView
            })
        }
        if (this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw.activeAction) {
            this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw.reset();
            deferred.cancel("User Cancel");
            return deferred.promise;
        }
        const drawAction = this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw.create("polyline", {mode:"freehand"});
        drawAction.on([
            "vertex-add",
            "vertex-remove",
            "cursor-update",
            "redo",
            "undo",
          ], lang.hitch(this, function(event) {
            if (event.vertices.length > 1) {
                this.mapView.graphics.removeAll();

                const graphic = {
                    geometry: {
                        type: "polyline",
                        paths: event.vertices,
                        spatialReference: this.mapView.spatialReference
                    },
                    symbol: {
                        type: "simple-line", 
                        color: [255, 30, 30],
                        width: 2,
                        cap: "round",
                        join: "round"
                    }
                };
                this.mapView.graphics.add(graphic);
            }
          }));
        drawAction.on("draw-complete", lang.hitch(this, function(event) {
            this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw.activeAction = null;
            this.mapView.graphics.removeAll();

            const q = parcelLayer.createQuery();
            q.outFields = ["OBJECTID"];
            // q.where = "1=1";
            q.geometry = {
                type: "polyline",
                paths: event.vertices,
                spatialReference: this.mapView.spatialReference
            };
            q.spatialRelationship = "intersects";
            q.returnGeometry = true;

            parcelLayer.queryFeatures(q).then(result => {
                const parcels = result.features;
                if (parcels.length > 0) {
                    q.geometry = geometryEngine.buffer(parcels.map(p => p.geometry), 2.5, "meters", true)[0];
                    q.outFields = ["*"];
                    q.spatialRelationship = "contains";
                    addressLayer.queryFeatures(q).then(result => {
                        const features = result.features;
                        if (features && features.length > 0) {
                            if (features.length > 1) {
                                const graphic = { geometry:q.geometry, symbol: this.SELECTED_PARCEL_SYMBOL };
                                this.mapView.graphics.add(graphic);
                            }

                            deferred.resolve(features);
                        } else {
                            deferred.cancel("No Addresses Found");
                        }
                    },
                    err => { deferred.cancel(err)})
                } else {
                    deferred.cancel("No Parcels Found");
                }
            },
            err => { deferred.cancel(err)})
        }))
        return deferred.promise;
    }

    _removeMarker = function(markerName:string) {
        for (let i = 0; i < this.mapView.graphics.length; i++) {
            const gr = this.mapView.graphics.toArray()[i];
            if (gr.symbol && ("name" in gr.symbol) && gr.symbol.name == markerName) {
                this.mapView.graphics.remove(gr);
                break;
            }
        };
    }

}

export = UtilsViewModel;