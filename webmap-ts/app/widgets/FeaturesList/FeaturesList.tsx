/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import dom = require("dojo/dom");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");

@subclass("esri.widgets.FeaturesList")
  class FeaturesList extends declared(Widget) {
  
    @property()
    mainView: __esri.MapView | __esri.SceneView;

    @property()
    tool: Tool;

    render() {
        return (
<ul id="featuresList"/>
        );
    }

}

export = FeaturesList;
