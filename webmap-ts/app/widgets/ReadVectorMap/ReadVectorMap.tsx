/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

import on = require("dojo/on");


@subclass("esri.widgets.ReadVectorMap")
  class ReadVectorMap extends declared(Widget) {
  
    @property()
    @renderable()
    vectorLayer: any;

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
    <div id="ReadVectorMapNode" 
    style="width: 1px; height: 1px; overflow: hidden; padding:2px" 
    afterCreate={this._addedNode} afterUpdate={this._layerUpdate}>
        <div aria-live="polite" aria-atomic="true" style="font-weight:bold;">{this.title}</div>
        <div aria-live="polite" aria-atomic="true">{this.content}</div>
    </div>
</div>
        );
    }

    private _addedNode = (element: Element) => {
        this.mapView.ui.add(element as HTMLElement,"bottom-left");
    }


    private mouseHandler;
    private _layerUpdate = (element: Element) => {
        this.title = this.vectorLayer ? this.vectorLayer.title : "";
        // this.content = "";

        if(this.vectorLayer) {
            this.mouseHandler = on.pausable(this.mapView, "pointer-move",(event) => {
                // console.log("MouseEvent", event);
                this.mapView.hitTest({x:event.x, y:event.y}).then((things) => {
                    // console.log("hitTest", things.results);
                    var g = things.results.filter(t => { return t.graphic.layer.type == "vector-tile"; }).map(t => t.graphic);
                    if(g.length>0)
                    {
                        // console.log("hitTest graphics", g[0]);//.attributes.layerName);
                        const content = g[0].attributes.layerName.replace(/\//g, " ");
                        if(this.content != content) {
                            this.content = content;
                            // console.log("graphics", g);
                        }
                    }
                    this.mouseHandler.pause();
                    setTimeout(() => {this.mouseHandler.resume();}, 250);
                });
            })
            this.own(this.mouseHandler);
        } else {
            this.mouseHandler = null;
        }
    }

}

export = ReadVectorMap;
