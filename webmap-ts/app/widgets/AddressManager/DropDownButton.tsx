/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget = require("esri/widgets/Widget");

import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import html = require("dojo/_base/html");

@subclass("esri.widgets.DropDownButton")
  class DropDownButton extends declared(Widget) {

    private dropDownArrowBtn;
    private dropDownButtonContent: HTMLElement;
    private defaultItemIndex = 0;
    private dropDownButton: HTMLInputElement;
    private btnClickHandler: any;
  

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
                    <input type="image" class="dropDownButton-main" afterCreate={this._addDropDownButton} />
                    <input type="image" class="dropDownButton-arrow" src="../images/icons_transp/downArrow.bggray.26x11.png" afterCreate={this._addDropDownArrowBtn} data-dojo-attach-event="click:_onDropDownClick" />
                    <div class="dropdown-content hide" afterCreate={this._addDropDownButtonContent} style="min-width:150px; min-height:25px;">
                    </div>
                </div>
            </div>
        );
    }

    private _addDropDownButton = (element: Element) => {
        this.dropDownButton = element as any;
    }

    private _addDropDownArrowBtn = (element: Element) => {
        this.dropDownArrowBtn = element as HTMLElement;

        this.own(on(this.dropDownArrowBtn, "click", (event) => {
            html.toggleClass(this.dropDownButtonContent, "hide");
            if (!(html as any).hasClass(this.dropDownButtonContent, "hide")) {
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
                    click: (event) => {
                        // console.log("click", event.target);
                        this.defaultItemIndex = Number(event.target.value);
                        this.dropDownButton.src = this.items[this.defaultItemIndex].src;
                        if (this.btnClickHandler) {
                            this.btnClickHandler.remove();
                        }
                        this.btnClickHandler = on(this.dropDownButton, "click", lang.hitch(this, this.items[this.defaultItemIndex].callback));
                        html.setAttr(this.dropDownButton, "title", this.items[this.defaultItemIndex].label);
                        this.dropDownButton.click();
                        html.removeClass(this.dropDownArrowBtn, "expand");
                        html.addClass(this.dropDownButtonContent, "hide");
                    }
                },
                label);

            const text = html.create("span", {
                innerHTML: item.label,
            }, label);
        });

        this.btnClickHandler = on(this.dropDownButton, "click", lang.hitch(this, this.items[0].callback));
        html.setAttr(this.dropDownButton, "title", this.items[0].label);
        html.setAttr(this.dropDownButton, "src", this.items[0].src);
    }

}
export = DropDownButton;