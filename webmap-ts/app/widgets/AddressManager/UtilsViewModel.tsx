/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import Accessor = require("esri/core/Accessor");

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import MapView = require("esri/views/MapView");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import Draw = require("esri/views/draw/Draw");
import geometryEngine = require("esri/geometry/geometryEngine");
import lang = require("dojo/_base/lang");
import html = require("dojo/_base/html");
import Query = require("esri/tasks/support/Query");
import { ENGINE_METHOD_ALL } from "constants";
import { Geometry, Point, Polyline } from "esri/geometry";
import Graphic = require("esri/Graphic");
import TextSymbol = require("esri/symbols/TextSymbol");
import Color = require("esri/Color");
import Font = require("esri/symbols/Font");
import { createSemicolonClassElement } from "typescript";
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");

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
        size: 12,
        outline: {
            color: [255, 30, 39, 1],
            width: 2,
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
            width: 2,
        }
    }

    @property({ readOnly: true })
    LINE_SELECT_PARCELS_SYMBOL = new SimpleLineSymbol({ style: "solid", color: [255, 0, 0, 0.33], width:5 });
    
    @property({ readOnly: true })
    SELECTED_PARCEL_SYMBOL = {
        type:"simple-fill",
        color: [0, 0, 0, 0],
        outline: {
            color: [255, 30, 30, 1],
            width: 2,
            type: "simple-line",
            style: "short-dot"
        }
    }
        
    @property({ readOnly: true })
    SELECTED_ROAD_SYMBOL = {
        type:"simple-line",
        style: "solid",
        width: 11,
        color: [0, 0xb9, 0xf6, 0.5],
    }
        
    LABEL_SYMBOL = function(labelText?: string) {
        const symb = {
            type: "text",
            text: labelText,
            color:[0, 0, 0],
            haloColor:[255, 255, 255],
            haloSize:3,
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
            color: [255, 255, 255, 1],
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
            setTimeout(() => { tempGraphicsLayer.removeAll(); }, 250);
            return deferred.promise;
        }

        require(["./CursorToolTip"], CursorToolTip =>{
            const cursorTooltip = CursorToolTip.getInstance(this.mapView, "Click a road to select");

            this.PICK_ROAD_sketchVM.create("point");
            this.PICK_ROAD_sketchVM.on("create", event => {
                
                if (event.state === "complete") {
                    const graphic = event.graphic;
                    cursorTooltip.close();
                    // console.log("event.graphic", event.graphic);

                    // sketchVM.layer.remove(graphic);
                    // mapView.graphics.add(graphic);

                    tempGraphicsLayer.removeAll();

                    const buffer = geometryEngine.buffer(graphic.geometry, 5, "meters");
        
                    const clickMarker = { 
                        geometry: buffer, 
                        symbol: this.BUFFER_SYMBOL
                    };
                    // console.log("gr", gr);

                    tempGraphicsLayer.add(clickMarker as any);
            
                    const q = this.roadsLayer.createQuery();
                    q.outFields = ["*"];
                    q.where = "1=1";
                    q.geometry = buffer as any;
                    q.spatialRelationship = "intersects";
                    q.returnGeometry = true;
            
                    this.roadsLayer.queryFeatures(q).then(
                        results => {
                            const roads = results.features;
                            if (roads.length == 1) {
                                const streetMarker = geometryEngine.buffer((roads[0] as any).geometry, 5, "meters");
                                const streetGraphic = { geometry:streetMarker, symbol:this.BUFFER_SYMBOL};
                                tempGraphicsLayer.add(streetGraphic as any)

                                setTimeout(() =>  { tempGraphicsLayer.removeAll(); }, 250);
                                deferred.resolve(roads[0]);
                            } else {
                                setTimeout(() =>  { tempGraphicsLayer.removeAll(); }, 250);
                                deferred.cancel("Too many or no matches")
                            }
                        },
                        error => {
                            // console.error("PICK_ROAD", error);
                            deferred.cancel(error);
                            setTimeout(() => { this.mapView.graphics.removeAll(); }, 250);
                        }
                    );
                }
            });
        });

        return deferred.promise;
    }

    ADD_NEW_ADDRESS_sketchVM: SketchViewModel = null;
    addressGraphicsLayer = null;
    
    ADD_NEW_ADDRESS = () => {
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

    PICK_ADDRESS_OR_PARCEL_draw = null; 

    PICK_ADDRESS_OR_PARCEL = (addressLayer, parcelLayer)  => {
        const deferred = new Deferred();
        // map.setInfoWindowOnClick(false);
        this.mapView.popup.close();

        if(!this.PICK_ADDRESS_OR_PARCEL_draw) {
            this.PICK_ADDRESS_OR_PARCEL_draw = new Draw({
            view: this.mapView
            })
        }
        require(["./CursorToolTip"], CursorToolTip =>{
            const cursorToolTip = CursorToolTip.getInstance(this.mapView, "Click Address or parcel");

            if (this.PICK_ADDRESS_OR_PARCEL_draw.activeAction) {
                this.PICK_ADDRESS_OR_PARCEL_draw.reset();
                cursorToolTip.close();

                deferred.cancel("User Cancel");
                return deferred.promise;
            }

            const drawAction = this.PICK_ADDRESS_OR_PARCEL_draw.create("point");
            drawAction.on("draw-complete", event => {
                cursorToolTip.close();

                this.PICK_ADDRESS_OR_PARCEL_draw = null; 

                const clickedPoint = new Point({ x: event.coordinates[0], y:event.coordinates[1], spatialReference: this.mapView.spatialReference} );

                const buffer = geometryEngine.buffer(clickedPoint, 2, "meters");
                const clickMarker = { 
                    geometry: buffer, 
                    symbol: this.BUFFER_SYMBOL
                };
                this.mapView.graphics.add(clickMarker as any);
        
                const q = new Query();
                q.outFields = ["*"];
                q.where = "1=1";
                q.geometry = buffer as Geometry;
                q.spatialRelationship = "contains";
                q.returnGeometry = true;

                const oldaddresses = addressLayer.queryFeatures(q);
                const newAddresses = this._getFeaturesWithin(this.addressGraphicsLayer, q.geometry);
                All([oldaddresses, newAddresses])
                .then(results => {
                    const features = [...(results[0] as any).features, ...(results[1] as any).features].filter(Boolean);
                    if (features && features.length == 1) {
                        deferred.resolve(features);
                        setTimeout(() => { this._removeGraphic(clickMarker, this.mapView.graphics); }, 250);
                    } else {
                        q.geometry = clickedPoint;
                        q.spatialRelationship = "intersects";
                        parcelLayer.queryFeatures(q).then(
                        result => {
                            const features = result.features;
                            if (features && features.length == 1) {
                                q.geometry = features[0].geometry;
                                q.spatialRelationship = "contains";
                                const oldaddresses = addressLayer.queryFeatures(q);
                                const newAddresses = this._getFeaturesWithin(this.addressGraphicsLayer, q.geometry);
                                All([oldaddresses, newAddresses])
                                .then(results => {
                                    const features = [...(results[0] as any).features, ...(results[1] as any).features].filter(Boolean);
                                    if (features && features.length > 0) {
                                        if (features.length > 1) {
                                            const g = { geometry: q.geometry, symbol: this.SELECTED_PARCEL_SYMBOL} as any;
                                            this.mapView.graphics.add(g);
                                        }
                                        deferred.resolve(features);
                                        setTimeout(() => { this._removeGraphic(clickMarker, this.mapView.graphics); }, 250);
                                    } else {
                                        deferred.cancel("No Addresses Found");
                                        setTimeout(() => { this._removeGraphic(clickMarker, this.mapView.graphics); }, 250);
                                    }
                                })
                            } else {
                                deferred.cancel("No Parcel Found");
                                setTimeout(() => { this._removeGraphic(clickMarker, this.mapView.graphics); }, 250);
                            }
                        })
                        
                    }
                })
            })
        })
        return deferred.promise;
    }

    PICK_ADDRESS_FROM_PARCEL_RANGE_draw: Draw = null;
    
    PICK_ADDRESS_FROM_PARCEL_RANGE = (addressLayer, parcelLayer) => {
        const deferred = new Deferred();
        // this.mapView.popup.autoOpenEnabled = false; // ?
        this.mapView.popup.close();

        require(["./CursorToolTip"], CursorToolTip =>{
            if(!this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw) {
                this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw = new Draw({
                view: this.mapView
                })
            }
            const cursorToolTip = CursorToolTip.getInstance(this.mapView, "Draw a line over parcels to select");

            if (this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw.activeAction) {
                this.PICK_ADDRESS_FROM_PARCEL_RANGE_draw.reset();
                cursorToolTip.close();
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
                cursorToolTip.close();

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
                        const oldaddresses = addressLayer.queryFeatures(q);
                        const newAddresses = this._getFeaturesWithin(this.addressGraphicsLayer, q.geometry);//this.addressGraphicsLayer.queryFeatures(q);
                        All([oldaddresses, newAddresses])
                        // addressLayer.queryFeatures(q)
                        .then(results => {
                            const features = [...(results[0] as any).features, ...(results[1] as any).features].filter(Boolean);
                            
                            if (features && features.length > 0) {
                                if (features.length > 1) {
                                    const graphic = { geometry:q.geometry, symbol: this.SELECTED_PARCEL_SYMBOL };
                                    this.mapView.graphics.add(graphic);
                                }

                                deferred.resolve(features);
                            } else {
                                deferred.resolve(null);
                                // deferred.cancel("No Addresses Found");
                            }
                        },
                        err => { deferred.cancel(err)})
                    } else {
                        deferred.resolve(null);
                        // deferred.cancel("No Parcels Found");
                    }
                },
                err => { deferred.cancel(err)})
            }))
        })
        return deferred.promise;
    }

    GET_LABEL_SYMBOL = function(labelText: string) {
        const symb = {
            type: "text",  // autocasts as new TextSymbol()
            color: "black",
            haloColor: "white",
            haloSize: "3px",
            text: labelText,
            // xoffset: 0,
            yoffset: -20,
            font: {  // autocast as new Font()
                size: 14,
                family: "'Avenir Light', Verdana, Geneva, sans-serif",
                weight: "bold"
            },

            name: "Label"
        }
        
        
        // new TextSymbol(labelText)
        //     .setColor(new Color([0, 0, 0, 255]))
        //     .setHaloColor(new Color([255, 200, 200, 255]))
        //     .setHaloSize(1)
        //     .setAlign(Font.ALIGN_MIDDLE)
        //     .setFont(new Font("12pt").setWeight(Font.WEIGHT_BOLD).setFamily("'Avenir Light', Verdana, Geneva, sans-serif"))
        //     .setOffset(0, -22);
        // symb.name = "Label";
        return symb;
    }
    
    _getFeaturesWithin = function(graphicsLayer, geometry) {
        let within = null
        if(graphicsLayer) {
            within = graphicsLayer.graphics.items.filter(g => geometryEngine.within(g.geometry, geometry) )
        } 
        return {features: within};
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

    _removeGraphic = function(graphic, layer) {
        if(layer) {
            const geometry = graphic.geometry;
            const selected = layer.find(g => g.geometry === geometry);
            if(selected) {
                layer.remove(selected);
            }
        }
    }

    public GetCentroidCoordinates = geometry => {
        let sX = 0;
        let sY = 0;
        let sA = 0;
        geometry.rings.forEach(r => {
            for (let i = 1; i < r.length; i++) {
                const [x, y] = r[i];
                const [x_1, y_1] = r[i - 1];

                const h = x - x_1;
                const a = y;
                const b = y_1;

                const ai = h * (a + b) / 2.0;
                const xi = x_1 + ((b + 2 * a) / (3 * (a + b))) * h;
                const yi = (((b + 2 * a) / (3 * (a + b))) * (a - b) + b) / 2.0;

                sX += xi * ai;
                sY += yi * ai;
                sA += ai;
            }
        })
        const coordinates = [sX / sA, sY / sA];
        const p = new Point({x:coordinates[0], y:coordinates[1], spatialReference: geometry.spatialReference});

        if (geometryEngine.within(p, geometry)) {
            return p;
        } else {
            const closestPoint = geometryEngine.nearestCoordinate(geometry, p);
            return closestPoint;
        }
    }

    public isSelfIntersecting = (polyline) => {
        if (polyline.geometry.paths[0].length < 3) {
          return false;
        }
        const getLastSegment = (polyline) => {
            const line = polyline.clone();
            const lastXYPoint = line.geometry.removePoint(0, line.geometry.paths[0].length - 1);
            const existingLineFinalPoint = line.geometry.getPoint(
              0,
              line.geometry.paths[0].length - 1
            );
  
            return {
              type: "polyline",
              spatialReference: this.mapView.spatialReference,
              hasZ: false,
              paths: [
                [
                  [existingLineFinalPoint.x, existingLineFinalPoint.y],
                  [lastXYPoint.x, lastXYPoint.y]
                ]
              ]
            } as any;
          }

        const line = polyline.clone();

        //get the last segment from the polyline that is being drawn
        const lastSegment = getLastSegment(polyline);
        line.geometry.removePoint(0, line.geometry.paths[0].length - 1);

        // returns true if the line intersects itself, false otherwise
        return geometryEngine.crosses(lastSegment, line.geometry);
    }

    public verticesWithoutLoops = (vertices : any[]) : any => {
        const deferred = new Deferred()
        const length = vertices.length;

        if(length < 10) {
            deferred.resolve(vertices);
        }
        
        const lastSegmentGeometry = new Polyline({
            spatialReference: this.mapView.spatialReference,
            hasZ: false,
            paths: [vertices.slice(length-2, length)]
        });

        const lineGeometry = new Polyline({
            spatialReference: this.mapView.spatialReference,
            hasZ: false,
            paths: [vertices.slice(0, length-5)]
        });

        try {
            const cuts = geometryEngine.cut(lineGeometry, lastSegmentGeometry);
            if(cuts && cuts.length == 2) {
                // console.log("cuts", cuts.map(c => c.paths[0]), length)
                deferred.resolve(cuts[1].paths[0]);
            }
            else {
                deferred.resolve(vertices);
            }
        } catch(error) {
            // console.log(error, lineGeometry, lastSegmentGeometry);
            deferred.cancel(error);
        }

        return deferred.promise;
    }

}

export = UtilsViewModel;