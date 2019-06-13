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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget", "dojo/on", "dojo/_base/html"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1, on, html) {
    "use strict";
    var CursorToolTip = /** @class */ (function (_super) {
        __extends(CursorToolTip, _super);
        function CursorToolTip() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._addToolTip = function (element) {
                _this.toolTip = element;
                _this.own(on(_this.mapView, "pointer-move", function (event) {
                    var px, py;
                    // if (event.clientX || event.pageY) {
                    px = event.native.clientX;
                    py = event.native.clientY;
                    // } else {
                    //   px = event.clientX + html.body.scrollLeft - dojo.body().clientLeft;
                    //   py = event.clientY + dojo.body().scrollTop - dojo.body().clientTop;
                    // }
                    // dojo.style(tooltip, "display", "none");
                    // this.toolTip.style.display = "none";
                    html.setStyle(_this.toolTip, { left: (px + 15) + "px", top: (py + 15) + "px" });
                    _this.toolTip.style.display = "";
                }));
            };
            return _this;
        }
        CursorToolTip.prototype.render = function () {
            return (widget_1.tsx("div", { class: "mapCursorTooltip", afterCreate: this._addToolTip }, this.content));
        };
        __decorate([
            decorators_1.property()
        ], CursorToolTip.prototype, "mapView", void 0);
        __decorate([
            decorators_1.property()
        ], CursorToolTip.prototype, "content", void 0);
        CursorToolTip = __decorate([
            decorators_1.subclass("esri.widgets.CursorToolTip")
        ], CursorToolTip);
        return CursorToolTip;
    }(decorators_1.declared(Widget)));
    return CursorToolTip;
});
//# sourceMappingURL=CursorToolTip.js.map