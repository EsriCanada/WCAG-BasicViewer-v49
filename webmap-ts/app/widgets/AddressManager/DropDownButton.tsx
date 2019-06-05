/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";

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

@subclass("esri.widgets.DropDownButton")
  class DropDownButton extends declared(Widget) {

    private dropDownArrowBtn;
    private dropDownButtonContent: HTMLElement;

    @property()
    parent;
  
    constructor() {
        super();
    }

    postInitialize() {
    }

    render() {
        return ( 
            <div class="DropDownButton">
                <div class="dropdown_moreTools">
                    <input type="image" class="dropDownButton-main" src="../images/icons_transp/pickAddressRange.bggray.24.png" data-dojo-attach-point="DropDownButton" />
                    <input type="image" class="dropDownButton-arrow" src="../images/icons_transp/downArrow.bggray.26x11.png" afterCreate={this._addDropDownArrowBtn} data-dojo-attach-event="click:_onDropDownClick" />
                    <div class="dropdown-content hide" afterCreate={this._addDropDownButtonContent} style="min-width:150px; min-height:25px;">
                    </div>
                </div>
            </div>
        );
    }

    private _addDropDownArrowBtn = (element: Element) => {
        this.dropDownArrowBtn = element as HTMLElement;
        this.own(on(this.dropDownArrowBtn, "click", (event) => {
            html.toggleClass(this.dropDownButtonContent, "hide");
            if (!domClass.contains(this.dropDownButtonContent, "hide")) {
                this.parent.emit("openMenu", { menu: this.dropDownButtonContent });
            }
        }))
    }

    private _addDropDownButtonContent = (element: Element) => {
        this.dropDownButtonContent = element as HTMLElement;
    }

}
export = DropDownButton;