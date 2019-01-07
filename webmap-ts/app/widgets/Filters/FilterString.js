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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/on", "dojo/dom-style", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, on, domStyle, widget_1, i18n) {
    "use strict";
    // import { NormalizeTitle } from "../../utils";
    var FilterString = /** @class */ (function (_super) {
        __extends(FilterString, _super);
        function FilterString() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._addedTextBox = function (element) {
                _this.valueTextBox = element;
            };
            _this._addedListInput = function (element) {
                _this.listInput = element;
            };
            _this._criteriaCreated = function (element) {
                _this.criteriaElement = element;
                _this.own(on(element, "change", function (event) {
                    switch (_this._getListMode()) {
                        case true:
                            domStyle.set(_this.valueTextBox, 'display', 'none');
                            domStyle.set(_this.listInput, 'display', '');
                            if (_this.listInput.innerHTML === '') {
                                _this.getFilterExpresion();
                            }
                            break;
                        case false:
                            domStyle.set(_this.valueTextBox, 'display', '');
                            domStyle.set(_this.listInput, 'display', 'none');
                            break;
                    }
                }));
            };
            _this._getListMode = function () {
                var criteria = _this.criteriaElement;
                return criteria.value === ' IN ' || criteria.value === ' NOT IN ';
            };
            _this.getFilterExpresion = function () {
                // require(["esri/tasks/support/Query", "esri/tasks/QueryTask"], (Query, QueryTask) => { 
                // console.log("Layer", this.layer, this.layer.loaded);
                // console.log("Field", this.field);
                var _query = _this.layer.createQuery();
                _query.where = "1=1";
                _query.outFields = [_this.field.name];
                _query.orderByFields = [_this.field.name];
                _query.returnDistinctValues = true;
                _query.returnGeometry = false;
                _this.layer.queryFeatures(_query).then(function (results) {
                    console.log("results", results);
                    // this.listInput.innerHTML = `<ul>`;
                    results.features.map(function (f) {
                        // console.log("attributes", f.attributes[this.field.name], f.attributes)
                        return f.attributes[_this.field.name];
                    }).forEach(function (v) {
                        if (v) {
                            // var id = this.id+'_'+v;
                            // this.listInput.innerHTML += '<input type="checkbox" class="checkbox" value="'+v+'" id="'+id+'"/>';
                            // this.listInput.innerHTML += '<label for="'+id+'" class="checkbox">'+v+'</label>';
                            // this.listInput.innerHTML += '<br />';
                            _this.listInput.innerHTML += "\n                        <li>\n                        <label role=\"presentation\">\n                            <input type=\"checkbox\" class=\"checkbox\" value=" + v + "/>\n                            <span>" + v + "</span>\n                        </label>\n                        </li>";
                        }
                    });
                    // this.listInput.innerHTML = `<ul>${this.listInput.innerHTML}</ul>`;
                });
                // });
            };
            return _this;
        }
        FilterString.prototype.render = function () {
            var id1 = "id1";
            var id2 = "id2";
            var format = "";
            return (widget_1.tsx("div", null,
                widget_1.tsx("select", { autofocus: true, tabindex: "0", afterCreate: this._criteriaCreated, class: "filter-filterItem__Criteria", "aria-label": i18n.FilterItem.selectCriteria },
                    widget_1.tsx("option", { value: " = " }, i18n.FilterItem.equal),
                    widget_1.tsx("option", { value: " != " }, i18n.FilterItem.notEqual),
                    widget_1.tsx("option", { value: " LIKE " }, i18n.FilterItem.like),
                    widget_1.tsx("option", { value: " NOT LIKE " }, i18n.FilterItem.notLike),
                    widget_1.tsx("option", { value: " IN " }, i18n.FilterItem.in),
                    widget_1.tsx("option", { value: " NOT IN " }, i18n.FilterItem.notIn)),
                widget_1.tsx("input", { type: "textbox", class: "filter-filterItem__textBox--text", "aria-label": i18n.FilterItem.enterValueToMatch, title: i18n.FilterItem.enterValueToMatch, afterCreate: this._addedTextBox }),
                widget_1.tsx("div", { style: "margin: 4px;" },
                    widget_1.tsx("ul", { class: "filter-filterItem__fieldExamples", style: "display:none;", afterCreate: this._addedListInput })),
                widget_1.tsx("div", { class: 'showErrors', style: "display:none;" })));
        };
        __decorate([
            decorators_1.property()
        ], FilterString.prototype, "layer", void 0);
        __decorate([
            decorators_1.property()
        ], FilterString.prototype, "field", void 0);
        FilterString = __decorate([
            decorators_1.subclass("esri.widgets.FilterString")
        ], FilterString);
        return FilterString;
    }(decorators_1.declared(Widget)));
    return FilterString;
});
//# sourceMappingURL=FilterString.js.map