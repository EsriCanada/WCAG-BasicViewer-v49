/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "dojo/_base/lang", "dojo/Deferred", "esri/symbols/SimpleMarkerSymbol", "esri/symbols/SimpleLineSymbol", "esri/symbols/SimpleFillSymbol", "esri/symbols/TextSymbol", "esri/tasks/GeometryService", "esri/Graphic", "esri/views/draw/Draw"], function (require, exports, __extends, __decorate, lang, Deferred, SimpleMarkerSymbol, SimpleLineSymbol, SimpleFillSymbol, TextSymbol, GeometryService, Graphic, Draw) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.SELECTED_ADDRESS_SYMBOL = new SimpleMarkerSymbol({
        // name: "selectedAddress",
        color: [255, 30, 30, 0],
        size: 10,
        // type: "esriSMS",
        style: "esriSMSCircle",
        outline: {
            color: [255, 30, 39, 255],
            width: 1,
            // type: "esriSLS",
            style: "esriSLSSolid"
        }
    });
    exports.NEW_ADDRESS_SYMBOL = new SimpleMarkerSymbol({
        // name: "newAddress",
        color: [255, 30, 30, 0],
        size: 5,
        // type: "esriSMS",
        style: "esriSMSCircle",
        outline: {
            color: [0, 0, 0, 255],
            width: 1,
            // type: "esriSLS",
            style: "esriSLSSolid"
        }
    });
    exports.SELECTED_PARCEL_SYMBOL = new SimpleFillSymbol({
        // name: "selectedParcel",
        color: [255, 30, 30, 255],
        // style: "esriSFSNull",
        outline: {
            color: [255, 30, 30, 255],
            width: 1,
            // type: "esriSLS",
            style: "esriSLSSolid"
        }
    });
    exports.SELECTED_ROAD_SYMBOL = new SimpleLineSymbol({
        // type: SimpleLineSymbol.STYLE_SOLID,
        color: [255, 30, 30, 255],
    });
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
    exports.GET_LABEL_SYMBOL = function (labelText) {
        var symb = new TextSymbol({
            text: labelText,
            color: [0, 0, 0, 255],
            haloColor: [255, 200, 200, 255],
            haloSize: 1,
            horizontalAlignment: "center",
            xoffset: 0,
            yoffset: -22,
            font: {
                family: "'Avenir Light', Verdana, Geneva, sans-serif",
                size: "12px",
                weight: "bold"
            }
        });
        symb.name = "Label";
        return symb;
    };
    exports.BUFFER_SYMBOL = new SimpleFillSymbol({
        // name: "addressBuffer",
        color: [255, 30, 30, 50],
        style: "esriSFSSolid",
    });
    exports.ADDRESS_ROAD_BUFFER_SYMBOL = new SimpleFillSymbol({
        // name: "addressRoadBuffer",
        color: [255, 30, 30, 0],
        style: "esriSFSSolid",
        outline: {
            color: [255, 30, 30, 127],
            width: 2,
            // type: "esriSLS",
            style: "esriSFSSolid"
        }
    });
    exports.SHOW_POINT = function (point, color, graphicLayer) {
        var symbol = new SimpleMarkerSymbol({
            // name: "newAddress",
            color: [255, 255, 255, 255],
            size: 5,
            // type: "esriSMS",
            style: "esriSMSCircle",
            outline: {
                color: color,
                width: 2,
                // type: "esriSLS",
                style: "esriSLSSolid"
            }
        });
        graphicLayer.add(new Graphic({ geometry: point, symbol: symbol }));
    };
    exports.ADD_NEW_ADDRESS = function (map, draw) {
        var deferred = new Deferred();
        map.setInfoWindowOnClick(false);
        map.infoWindow.hide();
        var drawDrawEnd = draw.on("draw-complete", lang.hitch(this, addToMap));
        draw.activate(Draw.POINT);
        function addToMap(event) {
            draw.deactivate();
            drawDrawEnd.remove();
            var feature = new Graphic(event.geometry, this.NEW_ADDRESS_SYMBOL);
            map.graphics.add(feature);
            feature.attributes = { "status": 0 };
            // feature.attributes[this.config.title] = "";
            feature["Dirty"] = true;
            map.setInfoWindowOnClick(true);
            // domClass.remove(event.target, "activeBtn");
            deferred.resolve(feature);
        }
        return deferred.promise;
    };
    exports.PICK_ADDRESS_OR_PARCEL = function (map, draw, addressLayerObj, parcelLayerObj) {
        var deferred = new Deferred();
        map.setInfoWindowOnClick(false);
        map.infoWindow.hide();
        var drawDrawEnd = draw.on("draw-complete", lang.hitch(this, selectAddress));
        draw.activate(Draw.POINT);
        function selectAddress(evt) {
            var _this = this;
            draw.deactivate();
            drawDrawEnd.remove();
            var buffer = geometryEngine.buffer(evt.geometry, 5, GeometryService.UNIT_METER);
            var q = new Query();
            q.outFields = ["*"];
            q.where = "1=1";
            q.geometry = buffer;
            q.spatialRelationship = "esriSpatialRelContains";
            q.returnGeometry = true;
            addressLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (results) {
                if (results && results.length == 1) {
                    deferred.resolve(results);
                }
                else {
                    q.geometry = evt.geometry;
                    q.spatialRelationship = "esriSpatialRelIntersects";
                    parcelLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (results) {
                        if (results && results.length == 1) {
                            q.geometry = results[0].geometry;
                            q.spatialRelationship = "esriSpatialRelContains";
                            addressLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (results) {
                                // console.log("features", results);
                                if (results && results.length > 0) {
                                    if (results.length > 1) {
                                        map.graphics.add(new Graphic(q.geometry, _this.SELECTED_PARCEL_SYMBOL));
                                    }
                                    deferred.resolve(results);
                                }
                                else {
                                    deferred.cancel("No Addresses Found");
                                }
                            });
                        }
                    });
                }
            });
        }
        return deferred.promise;
    };
    exports.PICK_MULTIPLE_ADDRESSES = function (map, draw, addressLayerObj) {
        var deferred = new Deferred();
        map.setInfoWindowOnClick(false);
        map.infoWindow.hide();
        var drawDrawEnd = draw.on("draw-complete", lang.hitch(this, selectAddress));
        draw.activate(Draw.FREEHAND_POLYGON);
        function selectAddress(evt) {
            var _this = this;
            draw.deactivate();
            drawDrawEnd.remove();
            var q = new Query();
            q.outFields = ["*"];
            q.where = "1=1";
            q.geometry = evt.geometry;
            q.spatialRelationship = "esriSpatialRelContains";
            q.returnGeometry = true;
            addressLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (results) {
                if (results && results.length > 0) {
                    var graphic = new Graphic(q.geometry, _this.SELECTED_PARCEL_SYMBOL);
                    // graphic.name = this.SELECTED_PARCEL_SYMBOL.name;
                    map.graphics.add(graphic);
                    deferred.resolve(results);
                }
                else {
                    deferred.cancel("No Addresses Found");
                }
            });
        }
        return deferred.promise;
    };
    exports.PICK_ADDRESS_FROM_PARCEL_RANGE = function (map, draw, addressLayerObj, parcelLayerObj) {
        var deferred = new Deferred();
        map.setInfoWindowOnClick(false);
        map.infoWindow.hide();
        var drawDrawEnd = draw.on("draw-complete", lang.hitch(this, selectAddressRange));
        draw.activate(Draw.FREEHAND_POLYLINE);
        function selectAddressRange(evt) {
            var _this = this;
            draw.deactivate();
            drawDrawEnd.remove();
            // const buffer = geometryEngine.buffer(evt.geometry, 5, GeometryService.UNIT_METER);
            var q = new Query();
            q.outFields = ["OBJECTID"];
            q.where = "1=1";
            q.geometry = evt.geometry;
            q.spatialRelationship = "esriSpatialRelCrosses";
            q.returnGeometry = true;
            parcelLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (parcels) {
                if (parcels.length > 0) {
                    var geoes = parcels.map(function (p) { return p.geometry; });
                    var union = geometryEngine.buffer(geoes, 2.5, GeometryService.UNIT_METER, true)[0];
                    var graphic = new Graphic(union, _this.SELECTED_PARCEL_SYMBOL);
                    map.graphics.add(graphic);
                    q.geometry = union;
                    q.outFields = ["*"];
                    q.spatialRelationship = "esriSpatialRelContains";
                    addressLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (features) {
                        if (features && features.length > 0) {
                            if (features.length > 1) {
                                var graphic_1 = new Graphic(q.geometry, _this.SELECTED_PARCEL_SYMBOL);
                                map.graphics.add(graphic_1);
                            }
                            deferred.resolve(features);
                        }
                        else {
                            deferred.cancel("No Addresses Found");
                        }
                    });
                }
                else {
                    deferred.cancel("No Parcels Found");
                }
            });
        }
        return deferred.promise;
    };
    exports.PICK_PARCEL_RANGE = function (map, draw, addressLayerObj, parcelLayerObj, emptyParcelsOnly) {
        var deferred = new Deferred();
        map.setInfoWindowOnClick(false);
        map.infoWindow.hide();
        var drawDrawEnd = draw.on("draw-complete", lang.hitch(this, selectParcelRange));
        draw.activate(Draw.FREEHAND_POLYLINE);
        function selectParcelRange(evt) {
            var _this = this;
            draw.deactivate();
            drawDrawEnd.remove();
            // const buffer = geometryEngine.buffer(evt.geometry, 5, GeometryService.UNIT_METER);
            var q = new Query();
            q.outFields = ["*"];
            q.where = "1=1";
            q.geometry = evt.geometry;
            q.spatialRelationship = "esriSpatialRelCrosses";
            q.returnGeometry = true;
            parcelLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (parcels) {
                if (parcels.length > 0) {
                    var geoes = parcels.map(function (p) { return p.geometry; });
                    var union = geometryEngine.buffer(geoes, 0.5, GeometryService.UNIT_METER, true)[0];
                    if (!emptyParcelsOnly) {
                        var graphic = new Graphic(union, _this.SELECTED_PARCEL_SYMBOL);
                        map.graphics.add(graphic);
                        deferred.resolve(parcels);
                    }
                    else {
                        q.geometry = union;
                        q.outFields = ["*"];
                        q.spatialRelationship = "esriSpatialRelContains";
                        addressLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (addresses) {
                            var emptyParcels = parcels.slice(0);
                            addresses.forEach(function (address) {
                                emptyParcels = emptyParcels.filter(function (parcel) { return !geometryEngine.within(address.geometry, parcel.geometry); });
                            });
                            if (emptyParcels.length > 0) {
                                emptyParcels.forEach(function (parcel) { return map.graphics.add(new Graphic(parcel.geometry, _this.SELECTED_PARCEL_SYMBOL)); });
                                deferred.resolve(emptyParcels);
                            }
                            else {
                                deferred.cancel("No Empty Parcels");
                            }
                        });
                    }
                }
                else {
                    deferred.cancel("No Parcels Found");
                }
            });
        }
        return deferred.promise;
    };
    exports.PICK_ROAD = function (map, draw, roadLayerObj) {
        var deferred = new Deferred();
        map.setInfoWindowOnClick(false);
        map.infoWindow.hide();
        var drawDrawEnd = draw.on("draw-complete", lang.hitch(this, pickRoad));
        draw.activate(Draw.POINT);
        function pickRoad(evt) {
            draw.deactivate();
            drawDrawEnd.remove();
            var buffer = geometryEngine.buffer(evt.geometry, 10, GeometryService.UNIT_METER);
            var q = new Query();
            q.outFields = ["*"];
            q.where = "1=1";
            q.geometry = buffer;
            q.spatialRelationship = "esriSpatialRelIntersects";
            q.returnGeometry = true;
            roadLayerObj.selectFeatures(q, FeatureLayer.SELECTION_NEW, function (roads) {
                if (roads.length == 1) {
                    // const roadMarker = geometryEngine.buffer(roads[0].geometry, 5, GeometryService.UNIT_METER);
                    // const road = new Graphic(roadMarker, this.BUFFER_SYMBOL);
                    // road.attributes = roads[0].attributes;
                    // // map.graphics.add(new Graphic(roadMarker, this.BUFFER_SYMBOL));
                    deferred.resolve(roads[0]);
                }
                else {
                    deferred.cancel("No matches");
                }
            });
        }
        return deferred.promise;
    };
    exports.GetCentroidCoordinates = function (geometry) {
        var sX = 0;
        var sY = 0;
        var sA = 0;
        geometry.rings.forEach(function (r) {
            for (var i = 1; i < r.length; i++) {
                var _a = r[i], x = _a[0], y = _a[1];
                var _b = r[i - 1], x_1 = _b[0], y_1 = _b[1];
                var h = x - x_1;
                var a = y;
                var b = y_1;
                var ai = h * (a + b) / 2.0;
                var xi = x_1 + ((b + 2 * a) / (3 * (a + b))) * h;
                var yi = (((b + 2 * a) / (3 * (a + b))) * (a - b) + b) / 2.0;
                sX += xi * ai;
                sY += yi * ai;
                sA += ai;
            }
        });
        var coordinates = [sX / sA, sY / sA];
        if (geometryEngine.within(new Point(coordinates), geometry)) {
            return coordinates;
        }
        else {
            var point = geometryEngine.nearestCoordinate(geometry, new Point(coordinates));
            return [point.coordinate.x, point.coordinate.y];
        }
    };
    if (!Element.prototype.closest) {
        Element.prototype.closest = function (s) {
            var el = this;
            var ancestor = this;
            if (!document.documentElement.contains(el))
                return null;
            do {
                try {
                    if (ancestor.matches(s))
                        return ancestor;
                }
                catch (ex) {
                    return null;
                }
                ancestor = ancestor.parentElement;
            } while (ancestor !== null);
            return null;
        };
    }
    Number.prototype.padLeft = function (n, str) {
        return new Array(n - String(this).length + 1).join(str || '0') + this;
    };
    Date.prototype.getSQLDate = function () {
        if (this.toDateString() === "Invalid Date") {
            return null;
        }
        return this.getFullYear().padLeft(4) + (this.getMonth() + 1).padLeft(2) + this.getDate().padLeft(2);
    };
    Date.prototype.toInputDate = function () {
        if (this.toDateString() === "Invalid Date") {
            return null;
        }
        // console.log("date", this);
        var date = this.getFullYear().padLeft(4) + "-" + (this.getMonth() + 1).padLeft(2) + "-" + this.getDate().padLeft(2);
        return (date === "1899-12-31") || (date === "1969-12-31") ? "" : date;
    };
    String.prototype.isNullOrWhiteSpace = function () {
        return this === undefined || this === null || this.trim() === "";
    };
    exports.removeIndex = function (array, from, to) {
        var rest = array.slice((to || from) + 1 || array.length);
        array.length = from < 0 ? array.length + from : from;
        return array.push.apply(array, rest);
    };
    ;
});
//# sourceMappingURL=Utils.js.map