/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import FilterBase = require("./FilterBase");


@subclass("esri.widgets.FilterItemBase")
    class FilterItemBase extends declared(FilterBase) {
    @property()
    showErrors: (err: string) => {};

    @property()
    value: any;
}

export = FilterItemBase;