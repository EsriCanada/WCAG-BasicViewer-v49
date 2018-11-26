/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, i18n) {
    "use strict";
    var ToolPage = /** @class */ (function (_super) {
        __extends(ToolPage, _super);
        function ToolPage() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ToolPage.prototype.render = function () {
            var classes = {};
            var pageTitle = i18n.tooltips[this.tool] || this.tool;
            var pageId = "page_" + this.tool;
            var name = this.tool;
            var panelClass = "";
            return (widget_1.tsx("div", { class: "page hideAttr" },
                widget_1.tsx("div", { class: "pageContent", role: "dialog", id: pageId, "aria-labelledby": "pagetitle_" + name },
                    widget_1.tsx("div", { id: "pageHeader_" + name, class: "pageHeader fc bg", "data-dojo-attach-point": "pageHeader" },
                        widget_1.tsx("h2", { class: "pageTitle fc", id: "pagetitle_" + name }, pageTitle),
                        widget_1.tsx("div", { id: "loading_" + name, class: "hideLoading small-loading", "data-dojo-attach-point": "LoadingIndicator" })),
                    widget_1.tsx("div", { class: "pageBody" + panelClass, tabindex: "0", id: "pageBody_" + name, "data-dojo-attach-point": "pageBody" }))));
        };
        __decorate([
            decorators_1.property()
        ], ToolPage.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], ToolPage.prototype, "tool", void 0);
        ToolPage = __decorate([
            decorators_1.subclass("esri.widgets.ToolPage")
        ], ToolPage);
        return ToolPage;
    }(decorators_1.declared(Widget)));
    return ToolPage;
});
//# sourceMappingURL=ToolPage.js.map