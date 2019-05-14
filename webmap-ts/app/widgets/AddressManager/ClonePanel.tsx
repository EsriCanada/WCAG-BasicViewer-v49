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
import html = require("dojo/_base/html");
import myUtils = require("./Utils"); 

import Deferred = require("dojo/Deferred");

import GeometryService = require("esri/tasks/GeometryService");
import GeometryEngine = require("esri/geometry/geometryEngine");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import Graphic = require("esri/Graphic");
import Draw = require("esri/views/draw/Draw");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.ClonePanel")
  class ClonePanel extends declared(Widget) {
  
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

    private roadSegments = [] as any;
    private polyline = null;
    private roadGeometries = null;
    private roadGraphicsLayer = null;
    private roadMarker = null;
    private draw = null;
    private roadGraphic = null;
    private addressRoadGraphic = null;
    private addressRoadGeometry = null;
    private deep = 20;

    constructor() {
        super();
        // this.draw = new Draw({
        //     view: this.mapView
        //   });
        // this.roadGraphicsLayer =  new GraphicsLayer();
        // (this.mapView.map as any).addLayer(this.roadGraphicsLayer);
    }

    render() {
        return ( 
        <div class="ClonePanel" style="display:none;" afterCreate={this._addClonePanel}>
            <div class="toolbar" style="background: #EEEEEE;">
                <input type="image" src="../images/icons_transp/pickRoad2.bgwhite.24.png" class="button" afterCreate={this._addPickRoadBtn} title="Pick Road" aria-label="Pick Road"/>
                <input type="image" src="../images/icons_transp/Cut.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onCutClicked" title="Cut Line" aria-label="Cut Line"/>
                <input type="image" src="../images/icons_transp/Flip1.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onFlipSideClicked" title="Flip Side" aria-label="Flip Side"/>
                <input type="image" src="../images/icons_transp/Flip2.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onReverseClicked" title="Reverse Direction" aria-label="Reverse Direction"/>
                <input type="image" src="../images/icons_transp/restart.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onRestartCutsClicked" title="Restart Cuts" aria-label="Restart Cuts"/>
            </div>
            <div class="clone_panel-content">
                <table style="border-collapse: collapse;">
                    <tr>
                        <th colspan="2" style="text-align: left;">
                            <span data-dojo-attach-point="streetName"></span>
                        </th>
                    </tr>
                    <tr data-dojo-attach-point="streetNameErrorRow" class="hide">
                        <th colspan="2">
                            <span data-dojo-attach-point="streetNameError" style="color:red;"></span>
                        </th>
                    </tr>
                    <tr>
                        <th colspan="2" style="text-align: left;">
                        <label>
                            <input type="checkbox" data-dojo-attach-point="useCurrentSeed" data-dojo-attach-event="change:_onUseCurrentSeedGhange"/>
                            <span> Use current address as seed.</span>
                            </label>
                            </th>
                    </tr>
                    <tr>
                        <th><label for="distRoad">Dist from Road:</label></th>
                        <td>
                            <input type="range" afterCreate={this._addDistRoadRange} style="width:100px; height:16px; vertical-align: bottom;" min="10" max="50" step="5" name="distRoad" value="20"/>

                            <span style="margin-left: 4px;" afterCreate={this._addDistRoadValue}>20</span>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="polylineLength">Length (meters):</label></th>
                        <td><span id="polylineLength" data-dojo-attach-point="polylineLength"></span></td> 
                    </tr>
                    <tr>
                        <th style="border-top: 1px solid gray; border-left: 1px solid gray;"><label for="unitCount">Unit Count:</label></th>
                        <td style="border-top: 1px solid gray; border-right: 1px solid gray;">
                            <input type="number" id="unitCount" style="width:100px; height:16px;" min="3" max="500" step="1" name="unitCountDist" value="10" data-dojo-attach-point="unitCount" data-dojo-attach-event="change:_onUnitCountChange,input:_onUnitCountInput"/>
                            <input type="radio" checked name="units" value="unitCount" data-dojo-attach-point="unitCountRadio"/>
                        </td>
                    </tr> 
                    <tr>
                        <th style="border-bottom: 1px solid gray; border-left: 1px solid gray;"><label for="unitDist">Unit Distance:</label></th>
                        <td style="border-bottom: 1px solid gray; border-right: 1px solid gray;">
                            <input type="number" id="unitDist" style="width:100px; height:16px;" min="20" max="100" step="1" name="unitCountDist" value="25" data-dojo-attach-point="unitDist" data-dojo-attach-event="change:_onUnitDistChange,input:_onUnitDistInput"/>
                            <input type="radio" name="units" value="unitDist" data-dojo-attach-point="unitDistRadio"></input>
                        </td>
                    </tr>
                    <tr>
                        <th><label for="StreeNumStart">Street # Start:</label></th>
                        <td>
                            <input type="number" id="StreeNumStart" style="width:100px; height:16px;" min="1" step="1" name="StreeNumStart" value="1" data-dojo-attach-point="StreeNumStart" data-dojo-attach-event="change:_onUnitCountChange,input:_onUnitCountInput"/>
                        </td> 
                    </tr>
                    <tr>
                        <th><label for="StreeNumStep">Street # Step:</label></th>
                        <td>
                            <input type="number" id="StreeNumStep" style="width:100px; height:16px;" min="1" max="8" step="1" name="StreeNumStep" value="2" data-dojo-attach-point="StreeNumStep" data-dojo-attach-event="change:_onUnitCountChange,input:_onUnitCountInput"/>
                        </td> 
                    </tr>
                </table>
            </div>
            <div class="footer">
                <input type="button" id="apply" class="pageBtn rightBtn" data-dojo-attach-point="submitCloneApply" value="Apply"/>>
            </div> 
        </div>
        );
    }

    private clonePanelDiv: HTMLElement;
    private distRoadRange: HTMLElement;
    private distRoadValue: HTMLElement;

    public show(showing:boolean):void {
        domStyle.set(this.clonePanelDiv, "display", showing ? "": "none");
    }

    private _addClonePanel = (element: Element) => {
        this.clonePanelDiv = element as HTMLElement;
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
    }

    private _addPickRoadBtn = (element:Element) => {
        this.own(on(element as HTMLElement, "click", lang.hitch(this, this._onPickRoadClicked)));
    }

    private _onPickRoadClicked = (event) => {
        html.addClass(event.target, "activeBtn");
        
        // console.log("_onPickRoadClicked", myUtils.PICK_ROAD);//, this.mapView.map, this.draw, this.roadsLayer.layerObject)
        myUtils.PICK_ROAD(this.mapView, this.roadsLayer);
            
        // ].then(
        //     roadSegment => {
        //         const found = this.roadSegments.find(road => roadSegment.attributes.OBJECTID == road.attributes.OBJECTID);
        //         if (!found) {
        //             this.roadSegments.push(roadSegment);
        //         } else {
        //             this.roadSegments.splice(this.roadSegments.indexOf(found), 1);
        //         }
        //         // this.doStreetNameRule();

        //         this.polyline = null;

        //         this.roadGraphicsLayer.clear();
        //         const geometries = this.roadGeometries = this.roadSegments.map(segment => segment.geometry);
        //         const roadMarker = GeometryEngine.geodesicBuffer(geometries, [5], (GeometryService as any).UNIT_METER, true) as any;
        //         this.roadMarker = roadMarker;
        //         this.roadGraphic = new Graphic({geometry: roadMarker, symbol: myUtils.BUFFER_SYMBOL});
        //         this.roadGraphicsLayer.add(this.roadGraphic);

        //         const buffer = GeometryEngine.geodesicBuffer(geometries, [this.deep], (GeometryService as any).UNIT_METER, true) as any;
        //         this.addressRoadGraphic = new Graphic({geometry: buffer, symbol: myUtils.ADDRESS_ROAD_BUFFER_SYMBOL});
        //         this.roadGraphicsLayer.add(this.addressRoadGraphic);

        //         this.addressRoadGeometry = buffer;

        //         // this.mapView.map.setInfoWindowOnClick(true);
        //         html.removeClass(event.target, "activeBtn"); 
        //     },
        //     err => {
        //         console.log("PICK_ROAD", err);

        //         // this.mapView.map.setInfoWindowOnClick(true);
        //         html.removeClass(event.target, "activeBtn");
        //     }
        // );
    }

}

export = ClonePanel;