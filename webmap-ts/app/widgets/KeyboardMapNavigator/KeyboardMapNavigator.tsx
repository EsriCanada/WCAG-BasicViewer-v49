/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import domStyle = require("dojo/dom-style");
import domClass = require("dojo/dom-class");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import on = require("dojo/on");
import gfx = require("dojox/gfx");
import { tsx } from "esri/widgets/support/widget";
import i18n = require("dojo/i18n!../nls/resources");
import { Point, ScreenPoint, Extent } from "esri/geometry";
import Circle = require("esri/geometry/Circle");
import Graphic = require("esri/Graphic");
import Color = require("esri/Color");
import { SimpleLineSymbol, SimpleFillSymbol } from "esri/symbols"; 
// import Query = require("esri/tasks/query");
import { Has } from "../../utils";

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

                
            // if(defaults.selectionColor && defaults.selectionColor !== undefined) {
            //     defaults.map.infoWindow.fillSymbol.outline.color = 
            //     defaults.map.infoWindow.markerSymbol.outline.color = 
            //     defaults.map.infoWindow.lineSymbol.color = 
            //         defaults.selectionColor;
            // }

            const selectionColor = new Color(this.selectionColor);
            selectionColor.a = 0.225;
            
            this.selectionSymbol = new SimpleFillSymbol(
                {style:"solid",
                //new SimpleLineSymbol(SimpleLineSymbol.STYLE_SOLID, new Color('White'), 2), 
                color:selectionColor}
                );
    }

    render() {
        return (
            <div
                id="mapSuperCursor"
                style="position:absolute; pointer-events:none;" 
                afterCreate={this._addCursor}>
            </div>
        );
    }

    private Show = () => {
        domStyle.set(this.mapSuperCursor, "display", "block");
    }

    private Hide = () => {
        domStyle.set(this.mapSuperCursor, "display", "none");
    }

    private mapSuperCursor;
    private cursorNav;
    private _addCursor = (element: Element) => {
        this.mapSuperCursor = element;
        this.mapView.ui.add(this.mapSuperCursor);
        
        this.cursorNav = gfx.createSurface(this.mapSuperCursor, 40, 40);
        const cursor = this.cursorNav.createGroup();
        const circle = cursor.createCircle({cx:20, cy:20, r:7}).setFill("transparent").setStroke(this.cursorFocusColor);
        const path = cursor.createPath("M20 0 L20 19 M20 21 L20 40 M0 20 L19 20 M21 20 L40 20").setStroke({color:this.cursorColor, width:1});

        domStyle.set(this.mapSuperCursor, 'left', "100px");
        domStyle.set(this.mapSuperCursor, 'top', "100px");
        this.cursorToCenter();
        this.Hide();

        this.own(on(this.mapView, 'focus', this.Show));
        this.own(on(this.mapView, 'blur', this.Hide));

        this.own(on(this.mapView, 'click', (evn) => {
            // this.followTheMapMode(false);
            this.setCursorPos(this.mapView.toScreen(evn.mapPoint));
            // this.clearZone();
        }));

        // on(this.map.infoWindow, 'hide', lang.hitch(this, function() {
        //     this.clearZone();
        // }));

        this.own(on(this.mapView.container, 'keydown', (evn) => {
            const focusElement = document.querySelector(':focus') as HTMLElement;
            // if(!focusElement || focusElement !== this.mapView.container) return; 
            switch(evn.keyCode)  {
                case 13: //Enter
                    // https://gis.stackexchange.com/questions/78976/how-to-open-infotemplate-programmatically
                    this.emit("mapClick", {mapPoint:this.mapView.toMap(this.cursorPos)});
                    this.showPopup(evn);
                    evn.preventDefault();
                    evn.stopPropagation();
                    break;
            }
        }));


        this.deferred.resolve(true);
    }

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

    private showPopup = (evn, mode:string = "point") : any => {
        const isVisibleAtScale = (layer : any) : boolean => {
            return (layer.minScale <= 0 || this.mapView.scale <= layer.minScale) &&
            (layer.maxScale <= 0 || this.mapView.scale >= layer.maxScale)
        } 
    // this.showError('');

        const deferred = new Deferred();

        const center = this.mapView.toMap(this.cursorPos);
        const features = [];
        this.layers = this.mapView.map.layers;//layers;
        // console.log("layers", this.layers);
        const visibleLayers = this.layers.filter((l) => { 
            return l.operationalLayerType == "ArcGISFeatureLayer" && l.visible && isVisibleAtScale(l);
        });
        // console.log("ArcGISFeatureLayers", visibleLayers);

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

        this.mapView.popup.visible = true;//show();
        this.getFeaturesAtPoint(center, mode, visibleLayers)
        // .then(lang.hitch(this, function(features){

        //     if(features && features !== undefined && features.length > 0) {
        //         this.map.infoWindow.setFeatures(features);
        //     }
        //     else 
        //         this.map.infoWindow.clearFeatures();

        //     if(!has('infoPanel'))
        //         this.map.infoWindow.show(center);

        //     deferred.resolve();
        // }),
        // lang.hitch(this, function(error) {
        //     // console.error(error);
        //     this.showError(error);
        //     this.loading(false);
        // }));
        // return deferred.promise;
    }

    private features = [];
    private getFeaturesAtPoint = (mapPoint, mode, layers) => {
        // this.loading(true);
        const deferred = new Deferred();

        this.features = [];
        if(!layers || layers.length === 0)
            deferred.resolve(this.features);
        else {

            let shape = this.mapView.extent as any;
            // if(!mapPoint) mapPoint = shape.getCenter();
            const w = shape.width/75;
            // var selectedFeature = this.map.infoWindow.getSelectedFeature();
            
            switch(mode) {
                case 'point':
                    shape = new Circle({
                        center: mapPoint,
                        geodesic: false,
                        radius: w,
                    });
                    break;
                case 'disk':
                    shape = new Circle({
                        center: mapPoint,
                        geodesic: true,
                        radius: w * 10,
                    });
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
                            const extent = shape.getExtent().expand(1.5);
                            this.mapView.extent = extent;
                        }
                    }
                    else {
                        deferred.reject(i18n.popupInfo.noPreselectedFeature);
                        return deferred.promise;
                    }
                    break;
            }

            this.clearZone();
            this.queryZone = new Graphic({geometry:shape, symbol:this.selectionSymbol});
            this.mapView.graphics.add(this.queryZone);

            const deferrs = [];
            layers.map(function(layer) {
                return layer.layerObject;
            })
            .filter(function(layer) { 
                return layer && layer.selectFeatures && layer.selectFeatures !== undefined;
            })
            .forEach((layer) => {
                const q = layer.createQuery();//new Query();
                q.outFields = ["*"];                    
                q.where = "1=1";
                q.geometry = shape;

                q.spatialRelationship = "esriSpatialRelIntersects";
                q.returnGeometry = true;

                const def = layer.selectFeatures(
                    q, "SELECTION_NEW", (results) => {
                        this.features = this.features.concat(results);
                    }
                );
                deferrs.push(def);
            });

            All(deferrs).then(() => {
                // this.loading(false);
                const features = this.features.filter(function(f) {
                    return f.getContent() != null;
                });
                if(features.length===0) {
                    deferred.reject(i18n.widgets.popupInfo.noFeatures);
                    return deferred.promise;
                } 
                else {
                    deferred.resolve(features);
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
