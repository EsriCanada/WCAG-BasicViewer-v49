/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import domClass = require("dojo/dom-class");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import on = require("dojo/on");
import gfx = require("dojox/gfx");
import { tsx } from "esri/widgets/support/widget";
import i18n = require("dojo/i18n!../nls/resources");
import { Geometry, Point, ScreenPoint, Extent } from "esri/geometry";
import geometryEngine = require( "esri/geometry/geometryEngine");
import Circle = require("esri/geometry/Circle");
import Graphic = require("esri/Graphic");
import Color = require("esri/Color");
import FeatureLayer = require("esri/layers/FeatureLayer");
import { SimpleLineSymbol, SimpleFillSymbol } from "esri/symbols"; 
import {
    BACKSPACE,
    copyKey,
    DELETE,
    DOWN_ARROW,
    END,
    ENTER,
    ESCAPE,
    HOME,
    LEFT_ARROW,
    RIGHT_ARROW,
    SHIFT,
    TAB,
    UP_ARROW
  } from "dojo/keys";

const CSS = {
    base: "toolbar",
};

@subclass("esri.widgets.KeyboardMapNavigator")
class KeyboardMapNavigator extends declared(Widget) {

    @property()
    cursorFocusColor:"red";
    
    @property()
    cursorColor:"black";

    @property()
    selectionColor:"yellow";
    
    @property()
    deferred: any;

    @property()
    mapView: __esri.MapView;

    private selectionSymbol;
    constructor() {
        super();
    }

    render() {
        return (
            <div
                id="mapSuperCursor"
                style="position:absolute; pointer-events:none;" 
                afterCreate={this._addCursor}>
                <div 
                    id="mapErrorWrapper" 
                    class="mapErrorWrapper" 
                    afterCreate={this._addedErrorWrapper}
                    // aria-live="assertive" aria-atomic="true" 
                    tabindex="0">
                    <img src="images/error.white.24.png" alt="error mark" aria-hidden="true"></img>
                    <span afterCreate={this._addedErrorText}>Error Text</span>
                </div>
            </div>
        );
    }

    private errorWrapper : HTMLDivElement;
    private _addedErrorWrapper = (element : Element) => {
        this.errorWrapper = element as HTMLDivElement;
        this.mapView.ui.add(this.errorWrapper, "bottom-left");
        this.own(on(this.errorWrapper, "blur", () => this.showError("")));
        this.own(on(this.errorWrapper, "keydown", (event) => {
            this.showError("");
            event.preventDefault();
            event.stopPropagation();
        }));
        this.showError("");
    }

    private errorText : HTMLSpanElement;
    private _addedErrorText = (element : Element) => {
        this.errorText = element as HTMLSpanElement;
    }

    private showError = (msg:string) => {
        this.errorText.innerHTML = msg;
        const show = !msg.isNullOrWhiteSpace();
        domStyle.set(this.errorWrapper, "display", show ? "" : "none");
        if(show) {
            this.errorWrapper.focus();
            this.clearZone();
        } 
        else {
            this.mapView.focus();
        }
    }

    private ShowCursor = () => {
        domStyle.set(this.mapSuperCursor, "display", "block");
    }

    private HideCursor = () => {
        domStyle.set(this.mapSuperCursor, "display", "none");
    }

    private loading = (show: boolean) => {
        if(show) {
            this.cursorGroup.add(this.loadingCursor);
        }
        else {
            this.cursorGroup.remove(this.loadingCursor);
        }
    }

    private mapSuperCursor;
    private loadingCursor;
    private cursorGroup;
    private stepX : number;
    private stepY : number;
    private _addCursor = (element: Element) => {
        this.mapSuperCursor = element;
        this.mapView.ui.add(this.mapSuperCursor);

        this.stepX = this.mapView.width * 0.0135;
        this.stepY = this.mapView.height * 0.0135;
        
        const selectionColor = new Color(this.selectionColor);
        selectionColor.a = 0.25;
        
        this.selectionSymbol = new SimpleFillSymbol({
            style:"solid",
            outline: { color: this.selectionColor, width:0},
            color:selectionColor
        });

        const cursor = gfx.createSurface(this.mapSuperCursor, 40, 40);
        this.cursorGroup = cursor.createGroup();
        this.cursorGroup.createPath("M20 0 L20 40 M0 20 L40 20").setStroke({color:"#ffffff5c", width:2});
        this.cursorGroup.createPath("M20 1 L20 39 M1 20 L39 20").setStroke({color:this.cursorColor, width:1});
        this.cursorGroup.createCircle({cx:20, cy:20, r:10}).setFill("transparent").setStroke(this.cursorFocusColor);
        this.loadingCursor = this.cursorGroup.createImage({x:0, y:0, width:40, height:40, src: "images/reload2.gif"});

        // console.log("loadingCursor", this.loadingCursor, this.cursorGroup);
        
        domStyle.set(this.mapSuperCursor, 'left', "100px");
        domStyle.set(this.mapSuperCursor, 'top', "100px");
        this.loading(false);
        this.cursorToCenter();
        this.HideCursor();

        this.own(on(this.mapView, 'focus', this.ShowCursor));
        this.own(on(this.mapView, 'blur', this.HideCursor));

        this.own(on(this.mapView, 'click', (evn) => {
            // this.followTheMapMode(false);
            this.setCursorPos(this.mapView.toScreen(evn.mapPoint));
            // this.clearZone();
        }));

        this.mapView.popup.watch("visible",(oldValue, newValue) => { 
            // console.log("oldValue, newValue", oldValue, newValue);
            if(newValue != null && !newValue) {
                this.clearZone();
            }
        });

        this.own(this.mapView.on('key-down', (event) => {
            if (event.key.slice(0, 5) === "Arrow") {
                // console.log("Arrow", event.key)
                event.stopPropagation();
            }
        }));

        this.mapScrollPausable = on.pausable(this.mapView.container, "keydown", this.mapScroll);
        this.own(this.mapScrollPausable);

        this.deferred.resolve(true);
    }

    private mapScrollPausable;
    private mapScroll = (event) => {
        const {code, key, shiftKey, ctrlKey} = event;

        // console.log("event", code, key, code || key, event);

        // ctrl+PgDn|PgUp does not exist or taken by browser
        const smallStep = shiftKey ? 0.2 : ctrlKey ? 5.0 : 1.0;

        const _mapScroll = (x, y, smallStep) => {
            // this.mapScrollPausable.pause();
            this.cursorScroll(x * this.stepX * smallStep, y * this.stepY * smallStep);//.then(() => {
                // this.mapScrollPausable.resume();
            //});
        };

        switch (code || key) {
            case "Enter" :
            case "NumpadEnter" :
                // https://gis.stackexchange.com/questions/78976/how-to-open-infotemplate-programmatically
                this.emit("mapClick", {mapPoint:this.mapView.toMap(this.cursorPos)});
                this.showPopup(event);
                event.preventDefault();
                event.stopPropagation();
                break;
            
            case "ArrowDown": 
            case "Numpad2":
            case "Down":
            case "2":
            //down
                event.stopPropagation();
                _mapScroll(0, 1, smallStep);
                break;
            
            case "ArrowUp": 
            case "Numpad8":
            case "Up": 
            case "8":
            //up
                event.stopPropagation();
                _mapScroll(0, -1, smallStep);
                break;
            
            case "ArrowLeft": 
            case "Numpad4":
            case "Left": 
            case "4":
            //left
                event.stopPropagation();
                _mapScroll(-1, 0, smallStep);
                break;
            case "ArrowRight": 
            case "Numpad6":
            case "Right": 
            case "6":
            //right
                event.stopPropagation();
                _mapScroll(1, 0, smallStep);
                break;
            case "Numpad3":
            case "3":
            // right + down
                _mapScroll(1, 1, smallStep);
                break;
            case "PageDown": 
            case "Numpad9":
            case "9":
            // right + up
                _mapScroll(1, -1, smallStep);
                break;
            case "Numpad1":
            case "1":
            case "End" :
            // left + down
                _mapScroll(-1, 1, smallStep);
                break;
            
            case "PageUp": 
            case "Numpad7":
            case "7":
            // left + up
                _mapScroll(-1, -1, smallStep);
                break;
            case "Home": 
            case "Numpad5":
            // center
                this.mapView.toMap(this.setCursorPos(this.cursorToCenter()));
                break;
        }
    };

    private cursorScroll = (dx, dy) => {
        var deferred = new Deferred();
        
        this.cursorPos.x += dx;
        this.cursorPos.y += dy;
        this.mapView.toMap(this.setCursorPos(this.cursorPos));

        const bounds = this.mapView.container.getBoundingClientRect();
        if((this.cursorPos.x < 20) || (this.cursorPos.x > bounds.width - 20) || 
            (this.cursorPos.y < 20) || (this.cursorPos.y > bounds.height - 20)
            ){
            this.mapView.goTo(this.mapView.toMap(this.cursorPos));
            this.mapView.toMap(this.setCursorPos(this.cursorToCenter()));
        }
        deferred.resolve();
       
        return deferred.promise;
    };

    private cursorPos: ScreenPoint;
    cursorToCenter = () : ScreenPoint => {
        const m = this.mapView.ui.container.getBoundingClientRect();
        this.cursorPos = new ScreenPoint({x:(m.right-m.left)/2, y:(m.bottom-m.top)/2});

        domStyle.set(this.mapSuperCursor, 'left', (this.cursorPos.x-20)+'px');
        domStyle.set(this.mapSuperCursor, 'top', (this.cursorPos.y-20)+'px');

        return this.cursorPos;
    }

    private setCursorPos = (screenPoint : ScreenPoint) : ScreenPoint => {
        if(screenPoint) {
            this.cursorPos = screenPoint;
        }
        domStyle.set('mapSuperCursor', 'left', (this.cursorPos.x-20)+'px');
        domStyle.set('mapSuperCursor', 'top', (this.cursorPos.y-20)+'px');
        return this.cursorPos;
    }

    private layers;

    private showPopup = (evn, mode:string = null) : any => {
        const isVisibleAtScale = (layer : any) : boolean => {
            return (layer.minScale <= 0 || this.mapView.scale <= layer.minScale) &&
            (layer.maxScale <= 0 || this.mapView.scale >= layer.maxScale)
        } 
        this.showError("");

        const deferred = new Deferred();

        // const center = this.mapView.toMap(this.cursorPos);
        const features = [];
        this.layers = this.mapView.map.layers;//layers;
        // console.log("layers", this.layers, this.mapView);
        const visibleLayers = this.layers.filter((l) => { 
            return l.operationalLayerType == "ArcGISFeatureLayer" && l.visible && l.popupEnabled && isVisibleAtScale(l);
        });
        // console.log("visibleLayers", visibleLayers);

        // // if(this.toolBar && this.toolBar.IsToolSelected('geoCoding')) 
        // //     mode = 'point';
        
        if(!mode) {
            if(!evn.shiftKey && !evn.ctrlKey) {
                mode = 'point';
            }
            else 
            if(evn.shiftKey && !evn.ctrlKey) {
                mode = 'disk';
            }
            else 
            if(!evn.shiftKey && evn.ctrlKey) {
                mode = 'extent';
            }
            else 
            if(evn.shiftKey && evn.ctrlKey) {
                mode = 'selection';
            }
        }

        this.followTheMapMode(mode === 'extent');

        // this.mapView.popup.close();
        this.mapView.popup.clear();
        this.getFeaturesAtPoint(this.mapView.toMap(this.cursorPos), mode, visibleLayers).then(
            (features: any[]) => {

            // console.log("features", features);        
            // console.log("this.mapView.popup", this.mapView.popup);
        

            if(features && features !== undefined && features.length > 0) {
                this.mapView.popup.features = features;
                this.mapView.popup.visible = true;
            }
            else {
                this.mapView.popup.visible = false;
            }

            // if(!Has('infoPanel'))
            //     this.mapView.popup.features = features;

            deferred.resolve();
        }
        ,
        (error) => {
            console.error(error);
            this.showError(error);
            this.loading(false);
        }
        );
        return deferred.promise;
    }

    private features = [];
    private getFeaturesAtPoint = (mapPoint : Point, mode: string, layers) => {
        this.loading(true);
        const deferred = new Deferred();


        this.features = [];
        if(!layers || layers.length === 0)
            deferred.resolve(this.features);
        else {

            const c = this.mapView.toScreen(mapPoint);
            const p1 : Point = new Point({x:c.x, y:c.y});
            const p2 : Point = new Point({x:c.x+10, y:c.y});
            const wc = this.mapView.toMap(new Point({x:c.x+Math.abs(p2.x - p1.x), y:c.y}));
            const w = Math.abs(wc.x - mapPoint.x);
            
            let shape : any;//Geometry | __esri.Geometry;

            switch(mode) {
                case 'point':
                    shape = new Circle({
                        center: mapPoint,
                        geodesic: false,
                        radius: w,
                    });
                    shape = geometryEngine.intersect(shape, this.mapView.extent);
                    break;
                case 'disk':
                    shape = new Circle({
                        center: mapPoint,
                        geodesic: false,
                        radius: w * 5,
                    });
                    shape = geometryEngine.intersect(shape, this.mapView.extent);
                    break;
                case 'extent':
                    shape = this.mapView.extent;
                    break;
                case 'selection':
                    const feature = this.mapView.popup.selectedFeature;
                    if(feature) {
                        shape = feature.geometry;
                        if(shape.type==='point') {
                            shape = new Circle({
                                center: shape,
                                geodesic: false,
                                radius: w,
                            });
                        }
                        else {
                            const extent = shape.extent.expand(1.5);
                            this.mapView.extent = extent;
                        }
                    }
                    else {
                        deferred.reject(i18n.popupInfo.noPreselectedFeature);
                        return deferred.promise;
                    }
                    break;
            }

            // console.log("mode", mode);

            this.clearZone();
            this.queryZone = new Graphic({geometry:shape, symbol:this.selectionSymbol});
            this.mapView.graphics.add(this.queryZone);

            const deferrs = [];
            layers.forEach((layer: FeatureLayer) => {
                const q = layer.createQuery();//new Query();
                q.outFields = ["*"];                    
                q.where = "1=1";
                q.geometry = shape;

                q.spatialRelationship = "esriSpatialRelIntersects";
                q.returnGeometry = true;

                const def = layer.queryFeatures(q).then((result) => {
                    this.features = this.features.concat(result.features);
                });
                deferrs.push(def);
            });

            All(deferrs).then(() => {
                this.loading(false);
                if(this.features.length===0) {
                    deferred.reject(i18n.widgets.popupInfo.noFeatures);
                    return deferred.promise;
                } 
                else {
                    deferred.resolve(this.features);
                }
            });
        }
        return deferred.promise;
    }

    private queryZone = null;
    private clearZone = () => {
        if(this.queryZone) {
            this.mapView.graphics.remove(this.queryZone);
        }
    }

    private followTheMapMode = (show) => {
        // if(!has('infoPanel')) 
        return;

        // if(show) {
        //     if(!this._followTheMapSignal) {
        //         this._followTheMapSignal =  on(this.map, 'extent-change', lang.hitch(this, this._followTheMap));
        //     }
        // } else {
        //     if(this._followTheMapSignal) {
        //         this._followTheMapSignal.remove();
        //         this._followTheMapSignal = null;
        //     }
        // }
        // if(this.badge) 
        //     this.badge(show);
    }
}

export = KeyboardMapNavigator;
