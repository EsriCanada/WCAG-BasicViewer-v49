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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/dom-construct", "dojo/query", "dojo/dom", "dojo/dom-style", "esri/widgets/support/widget", "dojo/i18n!../nls/resources", "../../utils"], function (require, exports, __extends, __decorate, decorators_1, Widget, domConstruct, query, dom, domStyle, widget_1, i18n, utils_1) {
    "use strict";
    var FilterTab = /** @class */ (function (_super) {
        __extends(FilterTab, _super);
        function FilterTab() {
            var _this = _super.call(this) || this;
            _this._addFilterTab = function (elemenet) {
                console.log("layer", _this.layer.title);
            };
            _this._addFilterContent = function (element) {
                var filterTabsContent = dom.byId("filterTabsContent");
                domConstruct.place(element, filterTabsContent);
                domStyle.set(element, "display", "none");
            };
            _this._filterTabChange = function (event) {
                console.log("_filterTabChange", event);
                var activePageId = event.target.value;
                var tabContentPages = query(".tabContent", dom.byId("filterTabsCOntent"));
                tabContentPages.forEach(function (page) {
                    domStyle.set(page, "display", page.id === activePageId ? "" : "none");
                });
            };
            _this._filterTabKeyPress = function (event) {
            };
            _this._filterAdd = function (event) {
            };
            _this._filterApply = function (event) {
            };
            _this._filterIgnore = function (event) {
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
                        widget_1.tsx("img", { id: this.id + "_img", src: "images/someFilters.png", class: "setIndicator", style: "display:none;", alt: badgeTip, title: badgeTip }))),
                widget_1.tsx("div", { class: "tabContent tabHide", id: this.id + "_page", afterCreate: this._addFilterContent },
                    widget_1.tsx("div", { class: "filterAdd" },
                        widget_1.tsx("label", { for: this.id + "-fieldsCombo" },
                            i18n.FilterTab.attribute,
                            "\u00A0"),
                        widget_1.tsx("select", { id: this.id + "-fieldsCombo", autofocus: true, tabindex: "0", "data-dojo-attach-point": "fieldsCombo" }),
                        widget_1.tsx("input", { type: "button", class: "fc bg pageBtn", value: i18n.FilterTab.add, onclick: "_filterAdd", style: "float: right;" })),
                    widget_1.tsx("ul", { "data-dojo-attach-point": "filterList" }),
                    widget_1.tsx("div", { class: "filterButtons" },
                        widget_1.tsx("input", { type: "button", class: "fc bg pageBtn", value: i18n.FilterTab.apply, onclick: "_filterApply" }),
                        widget_1.tsx("input", { type: "button", class: "fc bg pageBtn", value: i18n.FilterTab.ignore, onclick: "_filterIgnore" })))));
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