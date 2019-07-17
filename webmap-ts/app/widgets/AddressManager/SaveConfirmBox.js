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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/on", "esri/widgets/support/widget", "dojo/i18n!./nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, on, widget_1, i18n) {
    "use strict";
    var SaveConfirmBox = /** @class */ (function (_super) {
        __extends(SaveConfirmBox, _super);
        function SaveConfirmBox() {
            // @property()
            // selectionMade;
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._addConfirmBox = function (element) {
                _this.confirmBox = element;
            };
            _this._addConfirmBoxContent = function (element) {
                _this.confirmBoxContent = element;
            };
            _this._addCancelSaveBtn = function (element) {
                _this.cancelSaveBtn = element;
                _this.own(on(_this.cancelSaveBtn, "click", function (event) {
                }));
            };
            _this._addSaveConfirmBtn = function (element) {
                _this.saveConfirmBtn = element;
                _this.own(on(_this.saveConfirmBtn, "click", function (event) {
                }));
            };
            _this._addSaveConfirmSafeBtn = function (element) {
                _this.saveConfirmSafeBtn = element;
                _this.own(on(_this.saveConfirmSafeBtn, "click", function (event) {
                }));
            };
            return _this;
        }
        SaveConfirmBox.prototype.render = function () {
            return (widget_1.tsx("div", { class: "confirm", afterCreate: this._addConfirmBox, style: "display: none;" },
                widget_1.tsx("div", { class: "wrapper" },
                    widget_1.tsx("div", { class: "box" },
                        widget_1.tsx("div", { class: "header" }, i18n.addressManager.saveConfirmTitle),
                        widget_1.tsx("div", { class: "content", afterCreate: this._addConfirmBoxContent }),
                        widget_1.tsx("div", { class: "footer" },
                            widget_1.tsx("input", { type: "button", afterCreate: this._addSaveConfirmBtn, style: "justify-self: left;", class: "orangeBtn", value: "Save" }),
                            widget_1.tsx("input", { type: "button", afterCreate: this._addSaveConfirmSafeBtn, style: "justify-self: left;", class: "greenBtn", value: "Save as To Review" }),
                            widget_1.tsx("input", { type: "button", afterCreate: this._addCancelSaveBtn, style: "justify-self: right; grid-column-start: 5", class: "blankBtn", value: "Cancel" }))))));
        };
        SaveConfirmBox = __decorate([
            decorators_1.subclass("esri.widgets.SaveConfirmBox")
        ], SaveConfirmBox);
        return SaveConfirmBox;
    }(decorators_1.declared(Widget)));
    return SaveConfirmBox;
});
//# sourceMappingURL=SaveConfirmBox.js.map