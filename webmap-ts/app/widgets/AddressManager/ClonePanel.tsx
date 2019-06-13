/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import domClass = require("dojo/dom-class");
import html = require("dojo/_base/html");
import Deferred = require("dojo/Deferred");

import UtilsViewModel = require("./UtilsViewModel");

import GeometryService = require("esri/tasks/GeometryService");
import geometryEngine = require("esri/geometry/geometryEngine");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import Draw = require("esri/views/draw/Draw");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import Polyline = require("esri/geometry/Polyline");
import Point = require("esri/geometry/Point");
import SimpleLineSymbol = require("esri/symbols/SimpleLineSymbol");
import { watch } from "fs";

@subclass("esri.widgets.ClonePanel")
  class ClonePanel extends declared(Widget) {
  
    @property()
    parent;
  
    @property()
    mapView: __esri.MapView;

    @property()
    siteAddressPointLayer;

    @property()
    roadsLayer;

    @property()
    parcelsLayer;

    @property()
    roadFieldName: string;

    @property()
    onClose:any = null;

    private UtilsVM : UtilsViewModel;

    private roadSegments = [] as any;
    private polyline = null;
    private roadGeometries = null;
    private roadGraphicsLayer = null;
    private roadGraphic = null;
    private addressRoadGraphic = null;
    private addressRoadGeometry = null;
    private deep = 20;
    private polylineGraph: Graphic;
    private cutters: any[] = [];
    private flip: boolean = false;
    private length: Number = 0;
    private pickRoadBtn: HTMLElement;
    private roadCell: HTMLElement;
    private roadMarker: any = null;
    private submitCloneCancel: HTMLElement;
    cutBtn: HTMLElement;
    cutFlip: number;

    constructor() {
        super();
    }

    postInitialize() {
        this.roadGraphicsLayer =  new GraphicsLayer();
        this.mapView.map.add(this.roadGraphicsLayer);
        this.UtilsVM = new UtilsViewModel({mapView:this.mapView, roadsLayer: this.roadsLayer});
    }

    render() {
        return ( 
        <div class="ClonePanel dropdown-content hide" style="width:300px;" afterCreate={this._addClonePanel}>
            <div class="toolbar">
                <input type="image" src="../images/icons_transp/pickRoad2.bgwhite.24.png" class="button" afterCreate={this._addPickRoadBtn} title="Pick Road" aria-label="Pick Road"/>
                <input type="image" src="../images/icons_transp/Cut.bgwhite.24.png" class="button" afterCreate={this._addCutBtn} title="Cut Line" aria-label="Cut Line"/>
                <input type="image" src="../images/icons_transp/Flip1.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onFlipSideClicked" title="Flip Side" aria-label="Flip Side"/>
                <input type="image" src="../images/icons_transp/Flip2.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onReverseClicked" title="Reverse Direction" aria-label="Reverse Direction"/>
                <input type="image" src="../images/icons_transp/restart.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onRestartCutsClicked" title="Restart Cuts" aria-label="Restart Cuts"/>
            </div>
            <div class="content">
                <table style="border-collapse: collapse; border: none;">
                    <tr>
                        <th colspan="2" style="text-align: left;" afterCreate={this._addRoadCell} class="RoadCell hide">
                            <span afterCreate={this._addStreetName}></span>
                        </th>
                    </tr>
                    <tr afterCreate={this._addStreetNameErrorRow} class="hide">
                        <th colspan="2" style="text-align: left;" class="ErrorCell">
                            <span afterCreate={this._addStreetNameError}></span>
                            <img src="../../images/error.white.24.png" style="height:17px; float:right;" title="(Remove roads by selecting again.)"/>
                        </th>
                    </tr>
                    <tr>
                        <th colspan="2" style="text-align: left; padding: 0;">
                        <label>
                            <input type="checkbox" afterCreate={this._addUseCurrentSeed}/>
                            <span> Use current address as seed.</span>
                            </label>
                            </th>
                    </tr>
                    <tr>
                        <th><label for="distRoad">Distance from Road:</label></th>
                        <td>
                            <input type="range" afterCreate={this._addDistRoadRange} class="distRoadRange" min="10" max="50" step="5" name="distRoad" value="20"/>

                            <span style="float: right;" afterCreate={this._addDistRoadValue}>20</span>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="polylineLength">Length:</label></th>
                        <td><span id="polylineLength" data-dojo-attach-point="polylineLength"></span>
                        <span style="float:right; font-weight: normal; float: right;">meters</span></td> 
                    </tr>
                    <tr>
                        <th style="border-top: 1px solid gray; border-left: 1px solid gray;"><label for="unitCount">Unit Count:</label></th>
                        <td style="border-top: 1px solid gray; border-right: 1px solid gray;">
                            <input type="number" class="numInput" id="unitCount" min="3" max="500" step="1" name="unitCountDist" value="10" data-dojo-attach-point="unitCount" data-dojo-attach-event="change:_onUnitCountChange,input:_onUnitCountInput"/>
                            <input type="radio" checked name="units" value="unitCount" style="float: right;" data-dojo-attach-point="unitCountRadio"/>
                        </td>
                    </tr> 
                    <tr>
                        <th style="border-bottom: 1px solid gray; border-left: 1px solid gray;"><label for="unitDist">Unit Distance:</label></th>
                        <td style="border-bottom: 1px solid gray; border-right: 1px solid gray;">
                            <input type="number" class="numInput" id="unitDist" min="20" max="100" step="1" name="unitCountDist" value="25" data-dojo-attach-point="unitDist" data-dojo-attach-event="change:_onUnitDistChange,input:_onUnitDistInput"/>
                            <input type="radio" name="units" value="unitDist" style="float: right;" data-dojo-attach-point="unitDistRadio"></input>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="StreeNumStart">Street # Start:</label></th>
                        <td>
                            <input type="number" class="numInput" id="StreeNumStart" min="1" step="1" name="StreeNumStart" value="1" data-dojo-attach-point="StreeNumStart" data-dojo-attach-event="change:_onUnitCountChange,input:_onUnitCountInput"/>
                        </td> 
                    </tr>
                    <tr>
                        <th><label for="StreeNumStep">Street # Step:</label></th>
                        <td>
                            <input type="number" class="numInput" id="StreeNumStep" min="1" max="8" step="1" name="StreeNumStep" value="2" data-dojo-attach-point="StreeNumStep" data-dojo-attach-event="change:_onUnitCountChange,input:_onUnitCountInput"/>
                        </td> 
                    </tr>
                </table>
            </div>
            <div class="footer footer2cells">
            <input type="button" class="pageBtn" style="justify-self: left;" data-dojo-attach-point="submitCloneApply" value="Apply"/>
            <input type="button" class="pageBtn blankBtn" style="justify-self: right;" afterCreate={this._addSubmitCloneCancel} value="Cancel"/>
            </div> 
        </div>
        );
    }

    private clonePanelDiv: HTMLElement;
    private distRoadRange: HTMLElement;
    private distRoadValue: HTMLElement;
    private streetName:HTMLElement;
    private streetNameErrorRow:HTMLElement;
    private streetNameError:HTMLElement;
    private useCurrentSeed:HTMLInputElement;

    public show(showing:boolean):void {
        // domStyle.set(this.clonePanelDiv, "display", showing ? "": "none");
        if(!showing) {
            html.addClass(this.clonePanelDiv, "hide");
        } else {
            html.removeClass(this.clonePanelDiv, "hide");
            this.parent.emit("openMenu", { menu: this.container });
        }
    }

    private _addClonePanel = (element: Element) => {
        this.clonePanelDiv = element as HTMLElement;
        
        const mutationObserver = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                console.log("mutation", mutation);
                if(mutation.attributeName == "class" && domClass.contains(this.clonePanelDiv, "hide")) {
                    this.onClose();
                }
            });
        });

        mutationObserver.observe(this.clonePanelDiv, {
            attributes: true
        });
    }

    private _addSubmitCloneCancel = (element: Element) => {
        this.submitCloneCancel = element as HTMLElement;
        this.own(on(this.submitCloneCancel, "click", lang.hitch(this, function(event) {
            this.streetNameError.innerHTML = "";
            html.addClass(this.streetNameErrorRow, "hide");
            html.addClass(this.roadCell, "hide");
            this.roadGraphicsLayer.removeAll();
            this.roadSegments.length = 0;
            this.cutters = [];

            html.addClass(this.clonePanelDiv, "hide");

            // console.log("onClose", this.onClose);

            if(this.onClose) this.onClose();
        })));
    }

    private _addDistRoadRange = (element: Element) => {
        this.distRoadRange = element as HTMLElement;
        this.own(on(this.distRoadRange, "change", lang.hitch(this, this._distRoadRangeChange)));
    }

    private _addDistRoadValue = (element: Element) => {
        this.distRoadValue = element as HTMLElement;
    }

    private _distRoadRangeChange = (event) => {
        const value = event.target.value;
        this.distRoadValue.innerHTML = value;

        if (this.roadGeometries && this.roadGeometries.length > 0) {
            if (this.addressRoadGraphic) {
                this.roadGraphicsLayer.remove(this.addressRoadGraphic);
            }
            const [buffer] = geometryEngine.geodesicBuffer(this.roadGeometries, [this.deep = value], "meters", true) as any;
            this.addressRoadGraphic = new Graphic({geometry: buffer, symbol: this.UtilsVM.ADDRESS_ROAD_BUFFER_SYMBOL});
            this.roadGraphicsLayer.add(this.addressRoadGraphic);

            this.addressRoadGeometry = buffer;
            this._splitPolyline();
        }
    
    }

    private _addPickRoadBtn = (element:Element) => {
        this.pickRoadBtn = element as HTMLElement;
        this.own(on(this.pickRoadBtn, "click", lang.hitch(this, this._onPickRoadClicked)));
    }

    private _addStreetName = (element:Element) => {
        this.streetName = element as HTMLElement;
    }

    private _addRoadCell = (element:Element) => {
        this.roadCell = element as HTMLElement;
    }

    private _addStreetNameErrorRow = (element:Element) => {
        this.streetNameErrorRow = element as HTMLElement;
    }

    private _addStreetNameError = (element:Element) => {
        this.streetNameError = element as HTMLElement;
    }

    private _addUseCurrentSeed = (element:Element) => {
        this.useCurrentSeed = element as HTMLInputElement;
    }

    private _addCutBtn = (element:Element) => {
        this.cutBtn = element as HTMLElement;
        this.own(on(this.cutBtn, "click", event => this._onCutClicked(event)))
    }

    private _onPickRoadClicked = (event) => {
        html.addClass(event.target, "active");
        
        this.UtilsVM.PICK_ROAD().then(
            roadSegment => {
                html.removeClass(event.target, "active"); 
                // this.mapView.map.setInfoWindowOnClick(true);

                const found = this.roadSegments.find(road => (roadSegment as any).attributes.OBJECTID == road.attributes.OBJECTID);
                if (!found) {
                    this.roadSegments.push(roadSegment);
                } else {
                    this.roadSegments.splice(this.roadSegments.indexOf(found), 1);
                }
                // console.log("this.roadSegments", this.roadSegments);
                this._doStreetNameRule();

                this.polyline = null;

                this.roadGraphicsLayer.removeAll();
                
                const geometries = this.roadGeometries = this.roadSegments.map(segment => segment.geometry);
                const [roadMarker] = geometryEngine.geodesicBuffer(geometries, [2.5], "meters", true) as any;
                this.roadMarker = roadMarker;
                // console.log("roadMarker", roadMarker);
                this.roadGraphic = {geometry: roadMarker, symbol: this.UtilsVM.BUFFER_SYMBOL};
                // console.log("roadGraphic", this.roadGraphic);

                this.roadGraphicsLayer.add(this.roadGraphic);

                const [buffer] = geometryEngine.geodesicBuffer(geometries, [this.deep], "meters", true) as any;
                this.addressRoadGraphic = new Graphic({geometry: buffer, symbol: this.UtilsVM.ADDRESS_ROAD_BUFFER_SYMBOL});
                this.roadGraphicsLayer.add(this.addressRoadGraphic);

                this.addressRoadGeometry = buffer;
            },
            error => {
                console.error("PICK_ROAD", error);

                // this.mapView.map.setInfoWindowOnClick(true);
                html.removeClass(event.target, "active");
            }
        );
    }

    private _onCutClicked = event => {
        if (!this.addressRoadGeometry) return;
        const btn = event.target;
        html.addClass(btn, "active");
        // this.map.setInfoWindowOnClick(false);
        this.mapView.popup.close();

        // this.cutters = [];
        if (this.cutters.length == 0) {
            this.GET_CUTTER_BY_POINT(this.useCurrentSeed.checked && this.parent.selectedAddressPointFeature ? this.parent.selectedAddressPointFeature.geometry : null, [63, 127, 255, 255]).then(cutter => {
                this.cutters.push(cutter);
                this.GET_CUTTER_BY_POINT(null, [63, 127, 255, 255]).then(cutter => {
                    html.removeClass(event.target, "active");

                    this.cutters.push(cutter);

                    this._splitPolyline();
                    // this.map.setInfoWindowOnClick(true);
                })
            })
        } else {
            // this.cutFlip = (this.cutFlip + 1) % 2;

            // const cutter = this.cutters[this.cutFlip];
            // cutter.symbol.style = "solid";
            // cutter.symbol.width = 6;
            // this.roadGraphicsLayer.refresh();

            // if (!this.editToolbar) {
            //     this.editToolbar = new Edit(this.map);
            // }
            // this.editToolbar.activate(Edit.MOVE, cutter);

            // const moveStopHandler = this.editToolbar.on("graphic-move-stop", (evn) => {
            //     this.editToolbar.deactivate();
            //     moveStopHandler.remove();

            //     html.removeClass(event.target, "active");
            //     evn.graphic.symbol.style = "dash";
            //     evn.graphic.symbol.width = 2;
            //     this.roadGraphicLayer.refresh();

            //     this.splitPolyline();

            //     const refPoint = this.equalPoints[this.cutFlip * (this.equalPoints.length - 1)];
            //     // const graphic = new Graphic(refPoint, myUtils.SELECTED_ADDRESS_SYMBOL);
            //     // this.roadGraphicLayer.add(graphic);

            //     // const pl = new Polyline(this.map.spatialReference);
            //     // pl.paths = this.addressRoadGeometry.rings;

            //     // const p = geometryEngine.intersect(pl, cutter.geometry);

            //     this.getCutterByPoint(refPoint, [63, 127, 255, 255]).then(cutter => {
            //         this.roadGraphicsLayer.remove(this.cutters[this.cutFlip]);
            //         this.cutters[this.cutFlip] = cutter;
            //     });
            // })
        }
    }

    GET_CUTTER_BY_POINT_draw = null; 
    private GET_CUTTER_BY_POINT = (point, color) => {
        const deferred = new Deferred();
        if (point) {
            deferred.resolve(this.makeCutter(point /*.geometry*/ , color))
        } else {
            if(!this.GET_CUTTER_BY_POINT_draw) {
                this.GET_CUTTER_BY_POINT_draw = new Draw({
                view: this.mapView
                })
            }
    
            if (this.GET_CUTTER_BY_POINT_draw.activeAction) {
                this.GET_CUTTER_BY_POINT_draw.reset();
                deferred.cancel("User Cancel");
                // !
                return deferred.promise;
            }
    
            const drawAction = this.GET_CUTTER_BY_POINT_draw.create("point");
            drawAction.on("draw-complete", event => {
                this.GET_CUTTER_BY_POINT_draw = null; 
                const point = new Point({x:event.coordinates[0], y:event.coordinates[1], spatialReference: this.mapView.spatialReference});
                deferred.resolve(this.makeCutter(point, color))
            });
        }
        return deferred.promise;
    }

    private makeCutter = (p2, color) => {
        if (!this.addressRoadGeometry) return null;
        const nearestCoordinate = geometryEngine.nearestCoordinate(this.roadMarker, p2);
        const p1 = new Point(nearestCoordinate.coordinate);
        const d = nearestCoordinate.distance;

        const x1 = p1.x;
        const x2 = p2.x;
        const y1 = p1.y;
        const y2 = p2.y;

        const f = 100 / d;
        const x = x1 + (x2 - x1) * f;
        const y = y1 + (y2 - y1) * f;

        const p = new Point({x: x, y: y, spatialReference: this.mapView.spatialReference});

        const cutter = new Polyline({spatialReference:this.mapView.spatialReference});
        cutter.addPath([p1, p]);

        const cutterGraph = new Graphic({geometry: cutter, symbol:new SimpleLineSymbol({style: "dash", color: color, width:2})});
        (cutterGraph as any).name = "cutter";
        this.roadGraphicsLayer.add(cutterGraph);

        return cutterGraph;
    }

    private _doStreetNameRule = () => {
        if (this.roadSegments && this.roadSegments.length > 0) {
            html.removeClass(this.roadCell, "hide");
            const streetName = this.streetName.innerHTML = this.roadSegments[0].attributes.fullname;
            html.addClass(this.streetNameErrorRow, "hide");
            if (this.roadSegments.length > 1) {
                let more = "";
                this.roadSegments.forEach(segment => {
                    if (streetName != segment.attributes.fullname) {
                        html.removeClass(this.streetNameErrorRow, "hide");
                        this.streetNameError.innerHTML = segment.attributes.fullname + more;
                        more = " ...";
                    }
                })
            } else {
                this.streetNameError.innerHTML = "";
            }
        } else {
            html.addClass(this.roadCell, "hide");
        }
    }

    private _mesurePolyline() {
        // throw new Error("Method not implemented.");
    }

    private _getLength(): Number {
        // throw new Error("Method not implemented.");
        return 0;
    }

    private _splitPolyline() {
        if (this.cutters.length != 2) return;
        
        this.roadGraphicsLayer.removeAll();
        this.roadGraphicsLayer.add(this.roadGraphic);

        this.cutters.forEach(cutter => this.roadGraphicsLayer.add(cutter));

        this.polyline = new Polyline({spatialReference: this.mapView.spatialReference});
        this.polyline.addPath(this.addressRoadGeometry.rings[0]);

        const pieces = geometryEngine.cut(this.polyline, this.cutters[0].geometry);
        if (pieces.length == 2) {
            this.roadGraphicsLayer.remove(this.addressRoadGraphic);

            this.polyline = new Polyline({spatialReference: this.mapView.spatialReference});
            let point0 = new Point({ x: (pieces[1]as any).paths[0][0][0], y: (pieces[1]as any).paths[0][0][1] });

            if (geometryEngine.contains(this.cutters[0].geometry, point0)) {
                this.polyline.addPath(
                    [...pieces[1].paths[0], ...pieces[0].paths[0]]
                );
            } else {
                this.polyline.addPath(
                    [...pieces[0].paths[0], ...pieces[1].paths[0]]
                );
            }

            const pieces1 = geometryEngine.cut(this.polyline, this.cutters[1].geometry);
            if (pieces1.length == 2) {
                this.roadGraphicsLayer.remove(this.polylineGraph);

                this.polyline = new Polyline(this.addressRoadGeometry.spatialReference);
                switch (this.flip) {
                    case false:
                        this.polyline.addPath((pieces1[0] as any).paths[0]);
                        break;
                    case true:
                        this.polyline.addPath((pieces1[1] as any).paths[0]);
                        break;
                }
                const symb = new SimpleLineSymbol({ style: "solid", color: [255, 0, 0, 63], width:2 });
                this.polylineGraph = new Graphic({geometry: this.polyline,  symbol: symb});
                this.roadGraphicsLayer.add(this.polylineGraph);

                this.length = this._getLength();

                this._mesurePolyline();
            }
        }
    }

}
export = ClonePanel;