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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/support/widget", "./FilterItemBase"], function (require, exports, __extends, __decorate, decorators_1, widget_1, FilterItemBase) {
    "use strict";
    var FilterCodedDomain = /** @class */ (function (_super) {
        __extends(FilterCodedDomain, _super);
        function FilterCodedDomain() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            // private _addedTextBox = (element : Element) => {
            //     this.valueTextBox = element as HTMLInputElement;
            //     if(this.value && !this.value.isNullOrWhiteSpace()) {
            //         this.valueTextBox.value = this.value;
            //     }
            // }
            _this._addListInput = function (element) {
                _this.listInput = element;
                _this.field.domain.codedValues.forEach(function (v) {
                    if (v) {
                        var id = _this.id + "_" + v.code;
                        var check = v.code == _this.value ? ' checked' : '';
                        _this.listInput.innerHTML += "</label><input type=\"checkbox\" class=\"checkbox\" value=\"" + v.code + "\"" + check + " id=\"" + id + "\"/><label for=\"" + id + "\" class=\"checkbox\">" + v.name + "</label><br />";
                    }
                });
            };
            _this.getFilterExpresion = function () {
                var list = Array.prototype.slice.call(_this.listInput.children).filter(function (c) {
                    return c.nodeName == "INPUT" && c.checked;
                }).map(function (c) { return c.value; });
                if (!list || list.length === 0) {
                    return null;
                }
                else if (list.length == 1) {
                    return _this.field.name + " = '" + list[0] + "'";
                }
                else {
                    return _this.field.name + " IN ('" + list.join().replace(/,/g, "', '") + "')";
                }
            };
            return _this;
        }
        FilterCodedDomain.prototype.render = function () {
            return (widget_1.tsx("div", { class: "filter__grid-container" },
                widget_1.tsx("fieldset", { class: "_fieldExamples", afterCreate: this._addListInput })));
        };
        __decorate([
            decorators_1.property()
        ], FilterCodedDomain.prototype, "value", void 0);
        FilterCodedDomain = __decorate([
            decorators_1.subclass("esri.widgets.FilterCodedDomain")
        ], FilterCodedDomain);
        return FilterCodedDomain;
    }(decorators_1.declared(FilterItemBase)));
    return FilterCodedDomain;
});
//# sourceMappingURL=FilterCodedDomain.js.map