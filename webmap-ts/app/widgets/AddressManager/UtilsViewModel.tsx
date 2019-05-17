/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import Accessor = require("esri/core/Accessor");

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import MapView = require("esri/views/MapView");
import Map = require ("esri/Map");
import Deferred = require("dojo/Deferred");
import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import geometryEngine = require("esri/geometry/geometryEngine");
import lang = require("dojo/_base/lang");

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
        color: [255, 0, 0, 0.25],
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
            color: [255, 30, 30, 127],
            width: 2,
            type: "simple-line",
            style: "solid"
        }
    }

    PICK_ROAD() {
        const deferred = new Deferred();
        // mapView.setInfoWindowOnClick(false);
        // mapView.infoWindow.hide();

        // let drawDrawEnd = draw.on("draw-complete", lang.hitch(this, pickRoad));
        // draw.activate(Draw.POINT);
        const tempGraphicsLayer = new GraphicsLayer();

        this.mapView.map.add(tempGraphicsLayer);

        const sketchVM = new SketchViewModel({
            layer: tempGraphicsLayer,
            view: this.mapView,
          })
        sketchVM.create("point");
        sketchVM.on("create", lang.hitch(this, function(event) {
            
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
                    symbol: this.BUFFER_SYMBOL
                };
                // console.log("gr", gr);

                this.mapView.graphics.add(gr as any);
          
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
                            setTimeout(() => { 
                                this.mapView.graphics.removeAll(); 
                            }, 250);
                            deferred.resolve(roads[0]);
                        } else {
                            setTimeout(lang.hitch(function() { this.mapView.graphics.removeAll() }), 250);
                            deferred.cancel("Too many or no matches")
                        }
                    }),
                    error => {
                        // console.error("PICK_ROAD", error);
                        deferred.cancel(error);
                        setTimeout(lang.hitch(function() { this.mapView.graphics.removeAll() }), 250);
                    }
                );

            }

        }));

       return deferred.promise;
    }


}

export = UtilsViewModel;