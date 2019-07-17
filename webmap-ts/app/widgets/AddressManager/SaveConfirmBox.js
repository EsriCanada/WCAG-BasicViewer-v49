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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/on", "dojo/_base/html", "esri/widgets/support/widget", "dojo/i18n!./nls/resources", "dojo/i18n!esri/nls/common", "esri/core/watchUtils"], function (require, exports, __extends, __decorate, decorators_1, Widget, on, html, widget_1, i18n, i18nCommon, watchUtils) {
    "use strict";
    var SaveConfirmBox = /** @class */ (function (_super) {
        __extends(SaveConfirmBox, _super);
        function SaveConfirmBox() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.Response = null;
            _this._addConfirmBox = function (element) {
                _this.confirmBox = element;
            };
            _this._addConfirmBoxContent = function (element) {
                _this.confirmBoxContent = element;
            };
            _this._addCancelSaveBtn = function (element) {
                _this.cancelSaveBtn = element;
                _this.own(on(_this.cancelSaveBtn, "click", function (event) {
                    _this.Response = SaveConfirmBox_1.CANCEL;
                }));
            };
            _this._addSaveConfirmBtn = function (element) {
                _this.saveConfirmBtn = element;
                _this.own(on(_this.saveConfirmBtn, "click", function (event) {
                    _this.Response = SaveConfirmBox_1.SAVE;
                }));
            };
            _this._addSaveConfirmSafeBtn = function (element) {
                _this.saveConfirmSafeBtn = element;
                _this.own(on(_this.saveConfirmSafeBtn, "click", function (event) {
                    _this.Response = SaveConfirmBox_1.SAVE_SAFE;
                }));
            };
            _this.Ask = function (rules, title) {
                if (title === void 0) { title = null; }
                return new Promise(function (resolve, reject) {
                    if (rules == null || rules.length == 0) {
                        resolve(_this.Response = SaveConfirmBox_1.SAVE);
                    }
                    else {
                        _this.confirmBoxContent.innerHTML = rules.join("<br/>");
                        _this.Response = null;
                        html.setStyle(_this.confirmBox, "display", "");
                        watchUtils.once(_this, "Response", function () {
                            html.setStyle(_this.confirmBox, "display", "none");
                            if (_this.Response != SaveConfirmBox_1.CANCEL) {
                                resolve(_this.Response);
                            }
                            else {
                                reject(_this.Response);
                            }
                        });
                    }
                });
            };
            return _this;
        }
        SaveConfirmBox_1 = SaveConfirmBox;
        SaveConfirmBox.prototype.render = function () {
            return (widget_1.tsx("div", { class: "confirm", afterCreate: this._addConfirmBox, style: "display: none;" },
                widget_1.tsx("div", { class: "wrapper" },
                    widget_1.tsx("div", { class: "box" },
                        widget_1.tsx("div", { class: "header" },
                            widget_1.tsx("h1", null, i18n.addressManager.saveConfirmTitle)),
                        widget_1.tsx("div", { class: "content", afterCreate: this._addConfirmBoxContent }),
                        widget_1.tsx("div", { class: "footer" },
                            widget_1.tsx("input", { type: "button", afterCreate: this._addSaveConfirmBtn, style: "justify-self: left;", class: "orangeBtn", value: i18nCommon.save }),
                            widget_1.tsx("input", { type: "button", afterCreate: this._addSaveConfirmSafeBtn, style: "justify-self: left;", class: "greenBtn", value: i18n.addressManager.saveSafe }),
                            widget_1.tsx("input", { type: "button", afterCreate: this._addCancelSaveBtn, style: "justify-self: right; grid-column-start: 5", class: "blankBtn", value: i18nCommon.cancel }))))));
        };
        var SaveConfirmBox_1;
        SaveConfirmBox.SAVE = "SAVE";
        SaveConfirmBox.SAVE_SAFE = "SAVE_SAFE";
        SaveConfirmBox.CANCEL = "CANCEL";
        __decorate([
            decorators_1.property()
        ], SaveConfirmBox.prototype, "Response", void 0);
        SaveConfirmBox = SaveConfirmBox_1 = __decorate([
            decorators_1.subclass("esri.widgets.SaveConfirmBox")
        ], SaveConfirmBox);
        return SaveConfirmBox;
    }(decorators_1.declared(Widget)));
    return SaveConfirmBox;
});
//# sourceMappingURL=SaveConfirmBox.js.map