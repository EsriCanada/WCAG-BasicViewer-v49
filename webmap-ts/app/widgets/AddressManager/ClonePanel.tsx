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

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.ClonePanel")
  class ClonePanel extends declared(Widget) {
  
    render() {
        return ( 
        <div class="ClonePanel" style="display:none;" afterCreate={this._addClonePanel}>
            <div class="toolbar">
                <input type="image" src="../images/icons_transp/pickRoad2.bgwhite.24.png" class="button" data-dojo-attach-event="click:_onPickRoadClicked" title="Pick Road" aria-label="Pick Road"/>
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
                            <input type="range" style="width:100px; height:16px; vertical-align: bottom;" min="10" max="50" step="5" name="distRoad" value="20"/>

                            <span style="margin-left: 4px;" data-dojo-attach-point="distRoad">20</span>
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
            <div class="clone_panel-footer">
                {/* <input type="button" id="apply" class="pageBtn rightBtn" data-dojo-attach-point="submitCloneApply" value="Apply">
            */}</div> 
        </div>
        );
    }

    clonePanelDiv = null;

    public show(showing:boolean) {
        console.log("showing", showing);
        domStyle.set(this.clonePanelDiv, "display", showing ? "": "none");
    }

    private _addClonePanel = (element) => {
        this.clonePanelDiv = element;
    }

}


export = ClonePanel;