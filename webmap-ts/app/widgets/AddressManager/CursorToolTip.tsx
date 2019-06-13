/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { isPropertyAccessExpression } from "typescript";
import { renderable, tsx } from "esri/widgets/support/widget";

import on = require("dojo/on");
import html = require("dojo/_base/html");


@subclass("esri.widgets.CursorToolTip")
  class CursorToolTip extends declared(Widget) {
  
    @property()
    mapView;

    @property()
    content;

    private toolTip: HTMLElement;
    
    render() {
        return ( 
            <div class="mapCursorTooltip" afterCreate={this._addToolTip}>
                {this.content}
            </div>
        )
    }

    private _addToolTip = (element: Element) => {
        this.toolTip = element as HTMLElement;
        this.own(on(this.mapView, "pointer-move", event => {
            let px, py;        
            // if (event.clientX || event.pageY) {
              px = event.native.clientX;
              py = event.native.clientY;
            // } else {
            //   px = event.clientX + html.body.scrollLeft - dojo.body().clientLeft;
            //   py = event.clientY + dojo.body().scrollTop - dojo.body().clientTop;
            // }
                           
            // dojo.style(tooltip, "display", "none");
            // this.toolTip.style.display = "none";
            html.setStyle(this.toolTip, { left: (px + 15) + "px", top: (py + 15) + "px" });
            this.toolTip.style.display = "";
        }))
    }
}
export = CursorToolTip;
  
