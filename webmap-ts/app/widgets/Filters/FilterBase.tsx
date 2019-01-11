/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import Tool = require("../toolbar/Tool");


@subclass("esri.widgets.FilterBase")
    class FilterBase extends declared(Widget) {

    @property()
    layer: __esri.FeatureLayer;

    @property()
    field: __esri.Field;

    @property()
    hasErrors : boolean;

    @property()
    tool: Tool;

    @property()
    showErrors: (err: string) => {};
}

export = FilterBase;