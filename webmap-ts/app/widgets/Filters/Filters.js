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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1) {
    "use strict";
    var Filters = /** @class */ (function (_super) {
        __extends(Filters, _super);
        function Filters() {
            var _this = _super.call(this) || this;
            _this.layers = null;
            _this._addFilters = function (element) {
                _this.mainView.when(function (mapView) {
                    _this.layers = mapView.map.layers;
                    require(["./filterTab"], function (FilterTab) {
                        _this.layers.forEach(function (layer, i) {
                            new FilterTab({ layer: layer, id: "FilterTab_" + i, container: element });
                        });
                    });
                });
            };
            return _this;
        }
        Filters.prototype.render = function () {
            return (widget_1.tsx("div", { afterCreate: this._addFilters }));
        };
        __decorate([
            decorators_1.property()
        ], Filters.prototype, "mainView", void 0);
        Filters = __decorate([
            decorators_1.subclass("esri.widgets.Filters")
        ], Filters);
        return Filters;
    }(decorators_1.declared(Widget)));
    return Filters;
});
//# sourceMappingURL=Filters.js.map