/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

import on = require("dojo/on");
import domClass = require("dojo/dom-class");

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
    @renderable()
    mode: string = "mute";

    @property()
    mapView: __esri.MapView | __esri.SceneView;
    
    render() {
        const imgSrc = `.\\images\\speaker-${this.mode}.26.png`;
        const calcClass = this.mode == "view" ? "readVectorMap-speaker_showingArea" : "readVectorMap-speaker_hidingArea";
        const areaLive1 = this.mode == "mute" ? "off" : "polite";
        const areaLive2 = this.mode == "mute" ? "off" : "assertive";
        const title = this.mode == "play" ? "speaker on" : this.mode == "mute" ? "speaker off" : "speaker and caption";
        const show = this.vectorLayer != null ? "display:inherited;" : "display:none;";
        return (
<div>
    <div id="ReadVectorMapNode" class="readVectorMap-speaker" afterCreate={this._addedNode} afterUpdate={this._layerUpdate} style={show}>
        <div class={calcClass}>
            <div aria-live={areaLive1} aria-atomic="true" style="font-weight:bold;">{this.title}</div>
            <div aria-live={areaLive2} aria-atomic="true">{this.content}</div>
        </div>
        <div>
            <img src={imgSrc} class="readVectorMap-speaker_button" role="button" tabindex="0" afterCreate={this._addedBtn} alt="read map" title={title} aria-hidden="true"/>
            <div class="readVectorMap-speaker_hidingArea" aria-live="polite">{title}</div>
        </div>
    </div>
</div>
        );
    }

    private _addedNode = (element: Element) => {
        this.mapView.ui.add(element as HTMLElement,"top-right");
        domClass.remove(element, "esri-component");
    }

    private _btnImg : HTMLImageElement;
    private _addedBtn = (element: Element) => {
        this._btnImg = element as HTMLImageElement;
        this.own(on(this._btnImg, "click", (event)=> {
            switch (this.mode) {
                case "play" :
                    this.mode = "view";
                    break;
                case "view" :
                    this.mode = "mute";
                    break;
                case "mute" :
                    this.mode = "play"
                    break;
                default :
                    this.mode = "play"
                    break;
            }
        }));
        this.own(on(this._btnImg, "keydown", (event)=> {
            // console.log("keydown", event);
            if(event.key == "Enter" || event.key == " ") {
                this._btnImg.click();
            }
        }));
    }

    private mouseHandler;
    private _layerUpdate = (element: Element) => {
        this.title = this.vectorLayer ? this.vectorLayer.title : "";
        // this.content = "";

        if(this.vectorLayer) {
            this.mouseHandler = on.pausable(this.mapView, "pointer-move",(event) => {
                this.mapView.hitTest({x:event.x, y:event.y}).then((things) => {
                    // console.log("hitTest", things.results);
                    var g = things.results.filter(t => { return t.graphic.layer.type == "vector-tile"; }).map(t => t.graphic);
                    if(g.length>0)
                    {
                        // console.log("hitTest graphics", g[0]);//.attributes.layerName);
                        const content = g[0].attributes.layerName.replace(/\//g, ", ");
                        if(this.content != content) {
                            this.content = content;
                            // console.log("graphics", g);
                        }
                    }
                    this.mouseHandler.pause();
                    setTimeout(() => {this.mouseHandler.resume();}, 150);
                });
            })
            this.own(this.mouseHandler);
            this.own(on(this.mapView, "pointer-leave", (event) => {
                this.content = "";
            }));
        } else {
            this.mouseHandler = null;
            this.content = "";
        }
    }

}

export = ReadVectorMap;
