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
    @renderable()
    // content;
    get content(): string { return this._get("content"); };
    set content(value: string) {
        this._set("content", value);
        if(this.pausableHandler) {
            if(value) {
                this.pausableHandler.resume();
            } else {
                this.pausableHandler.pause();
            }
        }
    }

    private toolTip: HTMLElement;

    static cursorContainer;
    private static instance;
    
    private constructor() {
        super();
    }

    static getInstance(mapView, content) {
        if (!CursorToolTip.instance) {
            CursorToolTip.instance = new CursorToolTip();
            CursorToolTip.instance.mapView = mapView;
            CursorToolTip.instance.container = html.create("div", {
                style:"position:fixed;",
                class: "AddressManager"
            }, mapView.container);
        }

        CursorToolTip.instance.content = content;
        return CursorToolTip.instance;
    }

    render() {
        return ( 
            <div class="mapCursorTooltip" afterCreate={this._addToolTip} style="display:none;">
                {this.content}
            </div>
        )
    }

    private pausableHandler = null;
    private _addToolTip = (element: Element) => {
        this.toolTip = element as HTMLElement;
        this.own(this.pausableHandler = on.pausable(this.mapView, "pointer-move", event => {
            if(!this.content) return;
            const x = event.native.offsetX;
            const y = event.native.offsetY;
            html.setStyle(this.toolTip, { left: (x + 24) + "px", top: (y + 24) + "px", display: "" });
        }))
    }

    public close() {
        html.setStyle(this.toolTip, { display: "none"});
        this.content = null;
    }
}
export = CursorToolTip;
  
