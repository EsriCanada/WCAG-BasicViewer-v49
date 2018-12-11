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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/dom-construct", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, domConstruct, widget_1) {
    "use strict";
    var CSS = {
        // base
        base: "toc toc-panel",
        list: "toc-panel__list",
        listItem: "toc-panel__listItem",
    };
    var TOC = /** @class */ (function (_super) {
        __extends(TOC, _super);
        function TOC() {
            // @property()
            // config: ApplicationConfig;
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._addTOC = function (element) {
                var layers = _this.view.map.layers;
                console.log("allLayers", layers.map(function (layer) { return layer.title; }));
                layers.forEach(function (layer, i) {
                    var li = domConstruct.create("li", {
                        "data-item": i,
                        tabindex: 0,
                        class: CSS.listItem,
                        "aria-hidden": true
                    }, element);
                    var label = domConstruct.create("label", {
                        "aria-hidden": true
                    }, li);
                    domConstruct.create("input", {
                        type: "checkBox"
                    }, label);
                    domConstruct.create("span", {
                        innerHTML: layer.title.replace("_", " "),
                    }, label);
                });
            };
            return _this;
        }
        TOC.prototype.render = function () {
            return (widget_1.tsx("div", { class: CSS.base },
                widget_1.tsx("ul", { afterCreate: this._addTOC, bind: this, class: CSS.list })));
        };
        __decorate([
            decorators_1.property()
        ], TOC.prototype, "view", void 0);
        TOC = __decorate([
            decorators_1.subclass("esri.widgets.TOC")
        ], TOC);
        return TOC;
    }(decorators_1.declared(Widget)));
    return TOC;
});
//# sourceMappingURL=TOC.js.map