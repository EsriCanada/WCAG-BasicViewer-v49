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
import { isConstructSignatureDeclaration } from "typescript";

@subclass("esri.widgets.DropDownButton")
  class DropDownButton extends declared(Widget) {

    private dropDownArrowBtn;
    private dropDownButtonContent: HTMLElement;
    private defaultItemIndex = 0;

    @property()
    parent;
  
    @property()
    items;
  
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

        this.items.forEach((item, index) => {
            const itemWrapper = html.create("div", { class: "itemWrapper" }, this.dropDownButtonContent);
            const label = html.create("label", {}, itemWrapper);

            const btn = html.create("input", {
                    type: "image",
                    src: item.src,
                    value: index,
                    // click: (event) => {
                    //     // console.log("click", event.target);
                    //     this.defaultItemIndex = Number(event.target.value);
                    //     this.DropDownButton.src = this.items[this.defaultItemIndex].src;
                    //     if (this.btnClickHandler) {
                    //         this.btnClickHandler.remove();
                    //     }
                    //     this.btnClickHandler = on(this.DropDownButton, "click", lang.hitch(this, this.items[this.defaultItemIndex].callback));
                    //     domAttr.set(this.DropDownButton, "title", this.items[this.defaultItemIndex].label);
                    //     this.DropDownButton.click();
                    //     html.removeClass(this.DropDownArrowButton, "expand");
                    //     html.addClass(this.DropDownButtonContent, "hide");
                    // }
                },
                label);

            const text = html.create("span", {
                innerHTML: item.label,
            }, label);
        });
    }

}
export = DropDownButton;