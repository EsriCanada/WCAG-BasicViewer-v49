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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/_base/html", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, html, widget_1) {
    "use strict";
    var PickupRoads = /** @class */ (function (_super) {
        __extends(PickupRoads, _super);
        function PickupRoads() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.roadFieldName = "fullname";
            _this._addDomNode = function (element) {
                _this.domNode = element;
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
                html.setStyle(this.domNode, "display", value ? "" : "none");
                if (value) {
                    html.setStyle(this.domNode, "width", html.getStyle(this.input, "width") + "px");
                    // if (this.showMode == PickupRoads.MODE_ALL) {
                    //     this._showList();
                    // }
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
            return (widget_1.tsx("div", { class: "pickupRoads", style: "display:false;", afterCreate: this._addDomNode },
                widget_1.tsx("div", { class: "pickupRoads-header", "data-dojo-attach-point": "pickupRoadsHeader" },
                    widget_1.tsx("label", null,
                        widget_1.tsx("input", { type: "radio", name: "showRoads", "data-dojo-attach-event": "change:onShowRoads", value: "Address Point", checked: true }),
                        ">From Address Point"),
                    widget_1.tsx("label", null,
                        widget_1.tsx("input", { type: "radio", name: "showRoads", "data-dojo-attach-event": "change:onShowRoads", value: "Parcel" }),
                        ">From Parcel"),
                    widget_1.tsx("label", null,
                        widget_1.tsx("input", { type: "radio", name: "showRoads", "data-dojo-attach-event": "change:onShowRoads", value: "All" }),
                        ">All"),
                    widget_1.tsx("span", { "data-dojo-attach-point": "roadCount", style: "float:right;" })),
                widget_1.tsx("div", { class: "pickupRoads-list" },
                    widget_1.tsx("div", { "data-dojo-attach-point": "pickupRoadsLoading", class: "pickupRoads-list-loading" },
                        widget_1.tsx("img", { src: "./widgets/AddressManager/images/reload.gif" }),
                        ">"),
                    widget_1.tsx("ul", { "data-dojo-attach-point": "pickupRoadsList", tabindex: "0" })),
                widget_1.tsx("div", { class: "pickupRoads-footer", "data-dojo-attach-point": "pickupRoadsFooter" },
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