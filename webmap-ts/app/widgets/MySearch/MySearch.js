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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/_base/lang", "dojo/dom-construct", "esri/widgets/support/widget", "dojo/i18n!../nls/resources"], function (require, exports, __extends, __decorate, decorators_1, Widget, lang, domConstruct, widget_1, i18n) {
    "use strict";
    // import { Has, isNullOrWhiteSpace } from "../../utils";
    var Search = /** @class */ (function (_super) {
        __extends(Search, _super);
        function Search() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this._addSearch = function (element) {
                require(["esri/widgets/Search"], lang.hitch(_this, function (Search) {
                    document.getElementById("searchLabel").innerHTML = i18n.search;
                    var searchWidget = new Search({
                        view: this.mapView,
                        container: domConstruct.create("div", {}, element)
                    });
                    console.log("Search", searchWidget);
                }));
            };
            return _this;
        }
        Search.prototype.render = function () {
            return (widget_1.tsx("div", { afterCreate: this._addSearch }));
        };
        __decorate([
            decorators_1.property()
        ], Search.prototype, "config", void 0);
        __decorate([
            decorators_1.property()
        ], Search.prototype, "mapView", void 0);
        Search = __decorate([
            decorators_1.subclass("esri.widgets.Search")
        ], Search);
        return Search;
    }(decorators_1.declared(Widget)));
    return Search;
});
//# sourceMappingURL=MySearch.js.map