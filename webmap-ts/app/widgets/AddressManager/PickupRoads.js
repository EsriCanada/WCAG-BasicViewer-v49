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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/query", "dojo/on", "dojo/_base/html", "esri/geometry/geometryEngine", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, query, on, html, geometryEngine, widget_1) {
    "use strict";
    var PickupRoads = /** @class */ (function (_super) {
        __extends(PickupRoads, _super);
        function PickupRoads() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.roadFieldName = "fullname";
            _this._addDomNode = function (element) {
                _this.domNode = element;
                _this.roadsLayer.when(function (layer) { return __awaiter(_this, void 0, void 0, function () {
                    var _this = this;
                    return __generator(this, function (_a) {
                        return [2 /*return*/, new Promise(function (resolve) {
                                var q = layer.createQuery();
                                q.outFields = [_this.roadFieldName];
                                q.returnGeometry = true;
                                q.where = "1=1";
                                // q.spatialRelationship = "esriSpatialRelIntersects";
                                // q.returnDistinctValues = true;
                                _this.roadsLayer.queryFeatures(q).then(function (results) {
                                    // const roads1 = results.features;
                                    var segments = results.features.map(function (segment) { return ({ name: segment.attributes["fullname"], geometry: segment.geometry }); });
                                    _this.uniqueRoads = [];
                                    segments.forEach(function (currentSegment) {
                                        var exists = _this.uniqueRoads.find(function (segment) { return currentSegment.name == segment.name; });
                                        if (!exists) {
                                            _this.uniqueRoads.push(currentSegment);
                                        }
                                        else {
                                            exists.geometry = geometryEngine.union([exists.geometry, currentSegment.geometry]);
                                        }
                                    });
                                    _this.uniqueRoads.sort(function (a, b) { return ("" + a.name).localeCompare(b.name); });
                                    // console.log("uniqueRoads", this.uniqueRoads);
                                    resolve(_this.uniqueRoads);
                                }, function (err) {
                                    console.log("init roads", err);
                                });
                            })];
                    });
                }); });
            };
            _this._addRoadCount = function (element) {
                _this.roadCount = element;
            };
            _this._addShowRoads = function (element) {
                var input = element;
                _this.own(on(input, "change", function (event) {
                    var input = event.target;
                    if (!input.checked)
                        return;
                    var value = input.value;
                    console.log("input.value", value);
                    switch (value) {
                        case PickupRoads_1.MODE_ALL:
                            _this.showListAll();
                            break;
                        case PickupRoads_1.MODE_ADDRESS_POINT:
                            break;
                        case PickupRoads_1.MODE_PARCEL:
                            break;
                    }
                }));
            };
            _this._addPickupRoadsList = function (element) {
                _this.pickupRoadsList = element;
            };
            _this.showListAll = function () {
                _this.roadCount.innerHTML = "(" + _this.uniqueRoads.length + "}";
                var prev = "";
                _this.uniqueRoads.forEach(function (road) {
                    if (road.name[0] != prev) {
                        prev = road.name[0];
                        html.create("li", { innerHTML: prev, class: "firstLetter", "data-letter": prev }, _this.pickupRoadsList);
                    }
                    var li = html.create("li", { tabindex: "0" }, _this.pickupRoadsList);
                    var name = html.create("div", {
                        innerHTML: road.name,
                        class: "roadName"
                    }, li);
                    // this.own(on(name, "mouseover", event => {
                    //     console.log("mouseover", event);
                    // }));
                    // this.own(on(name, "mouseout", event => {
                    //     console.log("mouseout", event);
                    // }));
                    _this.own(on(li, "click", function (event) {
                        var streetName = event.target.innerHTML;
                        if (_this.input.value != streetName) {
                            _this.input.value = streetName;
                            if (_this.selectionMade) {
                                _this.selectionMade(streetName);
                            }
                        }
                    }));
                });
                on(_this.pickupRoadsList, "keyup", function (event) {
                    var key = event.key.toUpperCase();
                    // console.log("keyEvent", key);
                    if ((key >= "A" && key <= "Z") || (key >= "1" && key <= "9")) {
                        var tags = query(".firstLetter[data-letter='" + key + "']");
                        if (tags && tags.length === 1) {
                            // tags[0].scrollIntoView({ behavior: "smooth", block: "nearest" });
                        }
                    }
                });
            };
            return _this;
        }
        PickupRoads_1 = PickupRoads;
        Object.defineProperty(PickupRoads.prototype, "open", {
            get: function () {
                return this._get("open");
            },
            set: function (value) {
                this._set("open", value);
                // html.setStyle(this.domNode, "display", value ? "" : "none");
                if (value) {
                    html.removeClass(this.domNode, "hide");
                    html.setStyle(this.domNode, "width", html.getStyle(this.input, "width") + "px");
                    // if (this.showMode == PickupRoads.MODE_ALL) {
                    //     this._showList();
                    // }
                }
                else {
                    html.addClass(this.domNode, "hide");
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PickupRoads.prototype, "showMode", {
            get: function () {
                return this._get("showMode");
            },
            set: function (value) {
                if (this._get("showMode") != value) {
                    this._set("showMode", value);
                    // this._showList();
                }
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(PickupRoads.prototype, "feature", {
            set: function (value) {
                this._set("feature", value);
                if (!this.open || this.showMode != PickupRoads_1.MODE_ALL) {
                    // this._showList();
                }
            },
            enumerable: true,
            configurable: true
        });
        PickupRoads.prototype.render = function () {
            return (widget_1.tsx("div", { class: "pickupRoads hide", afterCreate: this._addDomNode },
                widget_1.tsx("div", { class: "header", "data-dojo-attach-point": "pickupRoadsHeader" },
                    widget_1.tsx("label", null,
                        widget_1.tsx("input", { type: "radio", name: "showRoads", afterCreate: this._addShowRoads, value: "Address Point", checked: true }),
                        "From Address Point"),
                    widget_1.tsx("label", null,
                        widget_1.tsx("input", { type: "radio", name: "showRoads", afterCreate: this._addShowRoads, value: "Parcel" }),
                        "From Parcel"),
                    widget_1.tsx("label", null,
                        widget_1.tsx("input", { type: "radio", name: "showRoads", afterCreate: this._addShowRoads, value: "All" }),
                        "All"),
                    widget_1.tsx("span", { afterCreate: this._addRoadCount, style: "float:right;" })),
                widget_1.tsx("div", { class: "roadsList" },
                    widget_1.tsx("ul", { afterCreate: this._addPickupRoadsList, tabindex: "0" })),
                widget_1.tsx("div", { class: "footer", "data-dojo-attach-point": "pickupRoadsFooter" },
                    widget_1.tsx("label", null,
                        widget_1.tsx("span", { style: "margin-right:4px;" }, "Max Distance:"),
                        widget_1.tsx("input", { type: "range", style: "width:110px; height:16px;", min: "20", max: "200", step: "10", name: "maxDistance", "data-dojo-attach-event": "change:onMaxDistance", value: "50" })),
                    widget_1.tsx("span", { style: "margin-left: 4px;", "data-dojo-attach-point": "distance" }, "50"),
                    widget_1.tsx("span", { style: "float:right;" }, "Meters"))));
        };
        var PickupRoads_1;
        PickupRoads.MODE_ALL = "All";
        PickupRoads.MODE_ADDRESS_POINT = "Address Point";
        PickupRoads.MODE_PARCEL = "Parcel";
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "mapView", void 0);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "roadsLayer", void 0);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "parcelLayer", void 0);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "input", void 0);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "roadFieldName", void 0);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "selectionMade", void 0);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "open", null);
        __decorate([
            decorators_1.property()
        ], PickupRoads.prototype, "showMode", null);
        __decorate([
            decorators_1.property("readonly")
        ], PickupRoads.prototype, "feature", null);
        PickupRoads = PickupRoads_1 = __decorate([
            decorators_1.subclass("esri.widgets.PickupRoads")
        ], PickupRoads);
        return PickupRoads;
    }(decorators_1.declared(Widget)));
    return PickupRoads;
});
//# sourceMappingURL=PickupRoads.js.map