/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import Accessor = require("esri/core/Accessor");

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";
import MapView = require("esri/views/MapView");
import Deferred = require("dojo/Deferred");
import FeatureLayer = require("esri/layers/FeatureLayer");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import SketchViewModel = require("esri/widgets/Sketch/SketchViewModel");
import geometryEngine = require("esri/geometry/geometryEngine");
import lang = require("dojo/_base/lang");
import html = require("dojo/_base/html");
import { IndexType } from "typescript";
import watchUtils = require("esri/core/watchUtils");
import Feature = require("esri/widgets/Feature");
import Collection = require("esri/core/Collection");

@subclass("esri.guide.AddressManagerViewModel")
class AddressManagerViewModel extends declared(Accessor) {

    @property()
    addressPointFeatures: Collection<Feature> = new Collection<Feature>();

    @property()
    addressPointFeaturesIndex = -1;

    @property()
    get selectedAddressPointFeature(): Feature {
        if(!this.addressPointFeatures || this.addressPointFeatures.length == 0 || this.addressPointFeaturesIndex < 0) {
            return null;
        }
        if(this.addressPointFeaturesIndex >= this.addressPointFeatures.length) {
            this.addressPointFeaturesIndex = this.addressPointFeatures.length-1; // ?
        }
        return this.addressPointFeatures[this.addressPointFeaturesIndex];
    }

    constructor() {
        super();
        // this.addressPointFeatures.watch("length", (newValue) => {
        //     // this.addressPointFeaturesIndex = this.addressPointFeatures.length > 0 ? 0 : -1; 
        // })
    }

}

export = AddressManagerViewModel;