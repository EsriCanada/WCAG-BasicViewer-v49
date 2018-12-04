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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/_base/lang", "dojo/dom-construct", "dojo/dom-attr", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, lang, domConstruct, domAttr, widget_1) {
    "use strict";
    var MyOverviewMap = /** @class */ (function (_super) {
        __extends(MyOverviewMap, _super);
        // @property()
        // config: ApplicationConfig;
        // @property()
        // myToolPage : ToolPage;
        // @property()
        // @renderable()
        // active: boolean;
        function MyOverviewMap() {
            var _this = _super.call(this) || this;
            _this._addOverviewMap = function (element) {
                require([
                    "esri/Map",
                    "esri/views/SceneView",
                    "esri/views/MapView",
                    "esri/core/watchUtils"
                ], lang.hitch(_this, function (Map, SceneView, MapView, watchUtils) {
                    var overviewMap = new Map({
                        basemap: "topo"
                    });
                    var overviewView = new MapView({
                        container: domConstruct.create("div", {
                            id: "overviewDiv"
                        }, element, "before"),
                        map: overviewMap,
                        constraints: {
                            rotationEnabled: false
                        }
                    });
                    overviewView.ui.components = [];
                    overviewView.when(function () {
                        var viewSurface = overviewView.container.querySelector(".esri-view-surface");
                        domAttr.remove(viewSurface, "tabindex");
                        console.log("viewSurface", viewSurface);
                    });
                    var extentDiv = document.getElementById("extentDiv");
                    // overviewView.when(function() {
                    // Update the overview extent whenever the MapView or SceneView extent changes
                    // console.log("overviewView.when", this, this.mainView);
                    overviewView.watch("extent", lang.hitch(this, updateOverviewExtent));
                    this.mainView.watch("extent", lang.hitch(this, updateOverviewExtent));
                    // Update the minimap overview when the main view becomes stationary
                    watchUtils.when(overviewView, "stationary", lang.hitch(this, updateOverview));
                    function updateOverview() {
                        // console.log("updateOverviewt");
                        // Animate the MapView to a zoomed-out scale so we get a nice overview.
                        // We use the "progress" callback of the goTo promise to update
                        // the overview extent while animating
                        if (overviewView.ready) {
                            overviewView.goTo({
                                center: this.mainView.center,
                                scale: this.mainView.scale * 3 * Math.max(this.mainView.width / overviewView.width, this.mainView.height / overviewView.height)
                            });
                        }
                    }
                    function updateOverviewExtent() {
                        // console.log("updateOverviewExtent");
                        // Update the overview extent by converting the SceneView extent to the
                        // MapView screen coordinates and updating the extentDiv position.
                        var extent = this.mainView.extent;
                        var bottomLeft = overviewView.toScreen(extent.xmin, extent.ymin);
                        var topRight = overviewView.toScreen(extent.xmax, extent.ymax);
                        extentDiv.style.top = topRight.y + "px";
                        extentDiv.style.left = bottomLeft.x + "px";
                        extentDiv.style.height = (bottomLeft.y - topRight.y) + "px";
                        extentDiv.style.width = (topRight.x - bottomLeft.x) + "px";
                    }
                    // },
                    // function(error) {
                    //     console.log("error", error);
                    // })
                }));
            };
            return _this;
        }
        MyOverviewMap.prototype.render = function () {
            return (widget_1.tsx("div", { class: "overviewDiv" },
                widget_1.tsx("div", { id: "extentDiv", tabindex: "0", role: "application", title: "Map Extent", afterCreate: this._addOverviewMap },
                    widget_1.tsx("span", { class: "esri-icon-font-fallback-text" }, "Move Extent Instructions"))));
        };
        __decorate([
            decorators_1.property()
        ], MyOverviewMap.prototype, "mainView", void 0);
        MyOverviewMap = __decorate([
            decorators_1.subclass("esri.widgets.MyOverviewMap")
        ], MyOverviewMap);
        return MyOverviewMap;
    }(decorators_1.declared(Widget)));
    return MyOverviewMap;
});
//# sourceMappingURL=MyOverviewMap.js.map