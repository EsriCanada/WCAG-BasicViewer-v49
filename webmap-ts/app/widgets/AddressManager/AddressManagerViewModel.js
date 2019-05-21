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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/Accessor", "esri/core/accessorSupport/decorators", "esri/core/Collection"], function (require, exports, __extends, __decorate, Accessor, decorators_1, Collection) {
    "use strict";
    var AddressManagerViewModel = /** @class */ (function (_super) {
        __extends(AddressManagerViewModel, _super);
        function AddressManagerViewModel() {
            var _this = _super.call(this) || this;
            _this.addressPointFeatures = new Collection();
            _this.addressPointFeaturesIndex = -1;
            _this.addressPointFeatures.watch("length", function (newValue) {
                _this.addressPointFeaturesIndex = _this.addressPointFeatures.length > 0 ? 0 : -1;
            });
            return _this;
        }
        Object.defineProperty(AddressManagerViewModel.prototype, "selectedAddressPointFeature", {
            get: function () {
                if (!this.addressPointFeatures || this.addressPointFeatures.length == 0 || this.addressPointFeaturesIndex < 0) {
                    return null;
                }
                if (this.addressPointFeaturesIndex >= this.addressPointFeatures.length) {
                    this.addressPointFeaturesIndex = this.addressPointFeatures.length - 1; // ?
                }
                return this.addressPointFeatures[this.addressPointFeaturesIndex];
            },
            enumerable: true,
            configurable: true
        });
        __decorate([
            decorators_1.property()
        ], AddressManagerViewModel.prototype, "addressPointFeatures", void 0);
        __decorate([
            decorators_1.property()
        ], AddressManagerViewModel.prototype, "addressPointFeaturesIndex", void 0);
        __decorate([
            decorators_1.property()
        ], AddressManagerViewModel.prototype, "selectedAddressPointFeature", null);
        AddressManagerViewModel = __decorate([
            decorators_1.subclass("esri.guide.AddressManagerViewModel")
        ], AddressManagerViewModel);
        return AddressManagerViewModel;
    }(decorators_1.declared(Accessor)));
    return AddressManagerViewModel;
});
//# sourceMappingURL=AddressManagerViewModel.js.map