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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/i18n!../nls/resources", "../../utils"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, i18n, utils_1) {
    "use strict";
    var FilterTab = /** @class */ (function (_super) {
        __extends(FilterTab, _super);
        function FilterTab() {
            var _this = _super.call(this) || this;
            _this._addFilterTab = function (elemenet) {
                console.log("layer", _this.layer.title);
            };
            _this._filterTabChange = function (event) {
            };
            _this._filterTabKeyPress = function (event) {
            };
            return _this;
        }
        FilterTab.prototype.render = function () {
            var layerTitle = utils_1.NormalizeTitle(this.layer.title);
            var badgeTip = i18n.badgesTips.someFilters;
            return (widget_1.tsx("div", null,
                widget_1.tsx("div", { class: "FilterTab" },
                    widget_1.tsx("input", { id: this.id + "_btn", type: "radio", name: "FilterTabsGroup", onchange: this._filterTabChange, value: this.id + "_page" }),
                    widget_1.tsx("label", { for: this.id + "_btn", "aria-label": layerTitle },
                        widget_1.tsx("span", { tabindex: "0", onkeypress: this._filterTabKeyPress, title: layerTitle }, layerTitle),
                        widget_1.tsx("img", { id: this.id + "_img", src: "images/someFilters.png", class: "setIndicator", 
                            // style="display:none; left:-4px;"
                            alt: badgeTip, title: badgeTip })))));
        };
        __decorate([
            decorators_1.property()
        ], FilterTab.prototype, "layer", void 0);
        __decorate([
            decorators_1.property()
        ], FilterTab.prototype, "id", void 0);
        FilterTab = __decorate([
            decorators_1.subclass("esri.widgets.FilterTab")
        ], FilterTab);
        return FilterTab;
    }(decorators_1.declared(Widget)));
    return FilterTab;
});
//# sourceMappingURL=filterTab.js.map