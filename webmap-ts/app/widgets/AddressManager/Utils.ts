/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import html = require("dojo/_base/html");
import myUtils = require("./Utils"); 

import Deferred = require("dojo/Deferred");

import Map = require("esri/Map");
import MapView = require("esri/views/MapView");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Graphic = require("esri/Graphic");
import Point = require("esri/geometry/Point");
import SimpleMarkerSymbol = require("esri/symbols/SimpleMarkerSymbol");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import SimpleFillSymbol = require("esri/symbols/SimpleFillSymbol");
import TextSymbol = require("esri/symbols/TextSymbol");
import Font = require("esri/symbols/Font");

import GeometryService = require("esri/tasks/GeometryService");
import geometryEngine = require("esri/geometry/geometryEngine");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
// import Draw = require("esri/views/draw/Draw");

    // exports.SELECTED_ADDRESS_SYMBOL = new SimpleMarkerSymbol({
    //     // name: "selectedAddress",
    //     color: [255, 30, 30, 0],
    //     size: 10,
    //     // type: "esriSMS",
    //     style: "esriSMSCircle",
    //     outline: {
    //         color: [255, 30, 39, 255],
    //         width: 1,
    //         // type: "esriSLS",
    //         style: "esriSLSSolid"
    //     }
    // })

    // exports.NEW_ADDRESS_SYMBOL = new SimpleMarkerSymbol({
    //     // name: "newAddress",
    //     color: [255, 30, 30, 0],
    //     size: 5,
    //     // type: "esriSMS",
    //     style: "esriSMSCircle",
    //     outline: {
    //         color: [0, 0, 0, 255],
    //         width: 1,
    //         // type: "esriSLS",
    //         style: "esriSLSSolid"
    //     }
    // })

    // exports.SELECTED_PARCEL_SYMBOL = new SimpleFillSymbol({
    //     // name: "selectedParcel",
    //     color: [255, 30, 30, 255],
    //     // style: "esriSFSNull",
    //     outline: {
    //         color: [255, 30, 30, 255],
    //         width: 1,
    //         // type: "esriSLS",
    //         style: "esriSLSSolid"
    //     }
    // })

    // exports.SELECTED_ROAD_SYMBOL = new SimpleLineSymbol(
    //     {
    //         // type: SimpleLineSymbol.STYLE_SOLID,
    //         color: [255, 30, 30, 255],
    //     }
    // )

    // exports.LABEL_SYMBOL = new TextSymbol({
    //         color:[0, 0, 0, 255],
    //         haloColor:[255, 200, 200, 255],
    //         haloSize:1,
    //         horizontalAlignment: "center",
    //         xoffset:0,
    //         yoffset: -22,
    //         font: {
    //             family : "'Avenir Light', Verdana, Geneva, sans-serif",
    //             size: "12px",
    //             weight: "bold"
    //         }
    //     });

    // exports.GET_LABEL_SYMBOL = function(labelText?) {
    //     const symb = new TextSymbol({
    //         text: labelText,
    //         color:[0, 0, 0, 255],
    //         haloColor:[255, 200, 200, 255],
    //         haloSize:1,
    //         horizontalAlignment: "center",
    //         xoffset:0,
    //         yoffset: -22,
    //         font: {
    //             family : "'Avenir Light', Verdana, Geneva, sans-serif",
    //             size: "12px",
    //             weight: "bold"
    //         }
    //     });
    //     (symb as any).name = "Label";
    //     return symb;
    // }

    const BUFFER_SYMBOL = {
        type:"simple-fill",
        color: [255, 0, 0, 0.25],
        outline: {
            color:"transparent",
            width:0,
            style:"solid"
        }
    }
    exports.BUFFER_SYMBOL = BUFFER_SYMBOL;

    // exports.ADDRESS_ROAD_BUFFER_SYMBOL = new SimpleFillSymbol({
    //     // name: "addressRoadBuffer",
    //     color: [255, 30, 30, 0],
    //     style: "esriSFSSolid",
    //     outline: {
    //         color: [255, 30, 30, 127],
    //         width: 2,
    //         // type: "esriSLS",
    //         style: "esriSFSSolid"
    //     }
    // })

    // exports.SHOW_POINT = function(point, color, graphicLayer) {
    //     const symbol = new SimpleMarkerSymbol({
    //         // name: "newAddress",
    //         color: [255, 255, 255, 255],
    //         size: 5,
    //         // type: "esriSMS",
    //         style: "esriSMSCircle",
    //         outline: {
    //             color: color,
    //             width: 2,
    //             // type: "esriSLS",
    //             style: "esriSLSSolid"
    //         }
    //     })

    //     graphicLayer.add(new Graphic({geometry: point, symbol:symbol}));
    // }

    exports.PICK_ROAD = function(mapView : MapView, roadLayer: FeatureLayer) {
        const deferred = new Deferred();
        // mapView.setInfoWindowOnClick(false);
        // mapView.infoWindow.hide();

        // let drawDrawEnd = draw.on("draw-complete", lang.hitch(this, pickRoad));
        // draw.activate(Draw.POINT);
        const tempGraphicsLayer = new GraphicsLayer();

        mapView.map.add(tempGraphicsLayer);

        const sketchVM = new SketchViewModel({
            layer: tempGraphicsLayer,
            view: mapView
          })
        sketchVM.create("point");
        sketchVM.on("create", function(event) {
            if (event.state === "complete") {
                const graphic = event.graphic;
                // console.log("event.graphic", event.graphic);

                // sketchVM.layer.remove(graphic);
                // mapView.graphics.add(graphic);

                tempGraphicsLayer.destroy();

                const buffer = geometryEngine.buffer(event.graphic.geometry, 5, "meters");
                // console.log("buffer", buffer);

                // console.log("BUFFER_SYMBOL", BUFFER_SYMBOL);
                let gr = { 
                    geometry: buffer, 
                    symbol: BUFFER_SYMBOL
                };
                // console.log("gr", gr);

                mapView.graphics.add(gr as any);
          
                const q = roadLayer.createQuery();
                q.outFields = ["*"];
                q.where = "1=1";
                q.geometry = buffer as any;
                q.spatialRelationship = "intersects";
                q.returnGeometry = true;
        
                roadLayer.queryFeatures(q).then(
                    results => {
                        const roads = results.features;
                        if (roads.length == 1) {
                            const roadMarker = geometryEngine.buffer(roads[0].geometry, 2.5, "meters");
                            const roadGraphic = { geometry: roadMarker, symbol: BUFFER_SYMBOL, attributes: roads[0].attributes};
                            // 
                            setTimeout(lang.hitch(function() { 
                                mapView.graphics.removeAll(); 
                                // mapView.graphics.add(roadGraphic as any);
                            }), 250);
                            deferred.resolve(roads[0]);
                        } else {
                            setTimeout(lang.hitch(function() { mapView.graphics.removeAll() }), 250);
                            deferred.cancel("Too many or no matches")
                        }
                    },
                    error => {
                        // console.error("PICK_ROAD", error);
                        deferred.cancel(error);
                        setTimeout(lang.hitch(function() { mapView.graphics.removeAll() }), 250);
                    }
                );

            }

        });

       return deferred.promise;
    }

