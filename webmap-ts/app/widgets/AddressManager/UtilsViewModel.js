/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "dojo/Deferred", "esri/layers/GraphicsLayer", "esri/widgets/Sketch/SketchViewModel", "esri/geometry/geometryEngine", "dojo/_base/lang"], function (require, exports, __extends, __decorate, Accessor, decorators_1, Deferred, GraphicsLayer, SketchViewModel, geometryEngine, lang) {
    "use strict";
    var UtilsViewModel = /** @class */ (function (_super) {
        __extends(UtilsViewModel, _super);
        function UtilsViewModel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // @property({ aliasOf: "mapView.map" })
            // map: Map;
            _this.BUFFER_SYMBOL = {
                type: "simple-fill",
                color: [255, 0, 0, 0.25],
                outline: {
                    color: "transparent",
                    width: 0,
                    style: "solid"
                }
            };
            _this.ADDRESS_ROAD_BUFFER_SYMBOL = {
                type: "simple-fill",
                color: [255, 30, 30, 0],
                style: "solid",
                outline: {
                    color: [255, 30, 30, 127],
                    width: 2,
                    type: "simple-line",
                    style: "solid"
                }
            };
            return _this;
        }
        UtilsViewModel.prototype.PICK_ROAD = function () {
            var deferred = new Deferred();
            // mapView.setInfoWindowOnClick(false);
            // mapView.infoWindow.hide();
            // let drawDrawEnd = draw.on("draw-complete", lang.hitch(this, pickRoad));
            // draw.activate(Draw.POINT);
            var tempGraphicsLayer = new GraphicsLayer();
            this.mapView.map.add(tempGraphicsLayer);
            var sketchVM = new SketchViewModel({
                layer: tempGraphicsLayer,
                view: this.mapView,
            });
            sketchVM.create("point");
            sketchVM.on("create", lang.hitch(this, function (event) {
                if (event.state === "complete") {
                    var graphic = event.graphic;
                    // console.log("event.graphic", event.graphic);
                    // sketchVM.layer.remove(graphic);
                    // mapView.graphics.add(graphic);
                    tempGraphicsLayer.destroy();
                    var buffer = geometryEngine.buffer(event.graphic.geometry, 5, "meters");
                    // console.log("buffer", buffer);
                    // console.log("BUFFER_SYMBOL", BUFFER_SYMBOL);
                    var gr = {
                        geometry: buffer,
                        symbol: this.BUFFER_SYMBOL
                    };
                    // console.log("gr", gr);
                    this.mapView.graphics.add(gr);
                    var q = this.roadsLayer.createQuery();
                    q.outFields = ["*"];
                    q.where = "1=1";
                    q.geometry = buffer;
                    q.spatialRelationship = "intersects";
                    q.returnGeometry = true;
                    this.roadsLayer.queryFeatures(q).then(lang.hitch(this, function (results) {
                        var _this = this;
                        var roads = results.features;
                        if (roads.length == 1) {
                            var roadMarker = geometryEngine.buffer(roads[0].geometry, 2.5, "meters");
                            var roadGraphic = { geometry: roadMarker, symbol: this.BUFFER_SYMBOL, attributes: roads[0].attributes };
                            // 
                            setTimeout(function () {
                                _this.mapView.graphics.removeAll();
                            }, 250);
                            deferred.resolve(roads[0]);
                        }
                        else {
                            setTimeout(lang.hitch(function () { this.mapView.graphics.removeAll(); }), 250);
                            deferred.cancel("Too many or no matches");
                        }
                    }), function (error) {
                        // console.error("PICK_ROAD", error);
                        deferred.cancel(error);
                        setTimeout(lang.hitch(function () { this.mapView.graphics.removeAll(); }), 250);
                    });
                }
            }));
            return deferred.promise;
        };
        __decorate([
            decorators_1.property()
        ], UtilsViewModel.prototype, "mapView", void 0);
        __decorate([
            decorators_1.property()
        ], UtilsViewModel.prototype, "roadsLayer", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], UtilsViewModel.prototype, "BUFFER_SYMBOL", void 0);
        __decorate([
            decorators_1.property({ readOnly: true })
        ], UtilsViewModel.prototype, "ADDRESS_ROAD_BUFFER_SYMBOL", void 0);
        UtilsViewModel = __decorate([
            decorators_1.subclass("esri.guide.UtilsViewModel")
        ], UtilsViewModel);
        return UtilsViewModel;
    }(decorators_1.declared(Accessor)));
    return UtilsViewModel;
});
//# sourceMappingURL=UtilsViewModel.js.map