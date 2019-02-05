/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

@subclass("esri.widgets.ReadVectorMap")
  class ReadVectorMap extends declared(Widget) {
  
    @property()
    @renderable()
    title: string = "Title";

    @property()
    @renderable()
    content: string = "Content";

    @property()
    mapView: __esri.MapView | __esri.SceneView;
    
    render() {
        return (
<div>
    <div id="ReadVectorMapNode" afterCreate={this._addedNode}>
        <div aria-live="polite" aria-atomic="true">{this.title}</div>
        <div aria-live="polite" aria-atomic="true">{this.content}</div>
    </div>
</div>
        );
    }

    private _addedNode = (element: Element) => {
        this.mapView.ui.add(element as HTMLElement,"bottom-left")
    }

}

export = ReadVectorMap;
