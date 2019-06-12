/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget = require("esri/widgets/Widget");

import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import html = require("dojo/_base/html");

@subclass("esri.widgets.DropDownItemMenu")
class DropDownItemMenu extends declared(Widget) {
    @property()
    parent;

    @property()
    fieldName: string;

    @property()
    attributes;

    @property()
    features: any;

    private dropDownButton: any;
    private menuContent: HTMLElement;
    private labelItem: HTMLElement;
    private sortItem: HTMLElement;
    private filterItem: HTMLElement;
    private copyItem: HTMLElement;
    private fillItem: HTMLElement;

    constructor() {
        super();
    }

    postInitialize() {
    }

    render() {
        return (
            <div>
                <input type="image" src="../images/Burger.24.png" class="dropdown-button" aria-label="More Options" data-field={this.fieldName} afterCreate={this._addDropDownBtn} />

                <ul class="dropdown-content hide" afterCreate={this._addMenuContent} style="margin: 0; padding: 0;">
                    <li tabindex="0" afterCreate={this._addLabelsItem}>
                        <a ahref="#" data-dojo-attach-point="labels" data-dojo-attach-event="click:_onMenuItemLabels">Show Labels</a>
                    </li>

                    <li tabindex="0" class="sortItem" afterCreate={this._addSortItem}>
                        <a ahref="#" data-dojo-attach-event="click:_onMenuItemSort">Sort On This</a>
                        <label title="Sort Order">
                            <input type="checkbox" data-dojo-attach-point="directionSort"/>
                            <img src="../images\icons_transp/ascending.black.18.png"/>
                        </label>
                    </li>

                    <li tabindex="0" afterCreate={this._addFilterItem}>
                        <a ahref="#" data-dojo-attach-point="filter" data-dojo-attach-event="click:_onMenuItemFilter">Filter This Value</a>
                    </li>

                    <li tabindex="0" class="copyToAllItem" afterCreate={this._addCopyItem}>
                        <a ahref="#" data-dojo-attach-event="click:_onMenuItemCopyToAll">Copy To All</a>
                        <input type="button" data-dojo-attach-point="copyDomain" data-dojo-attach-event="click:_onCopyDomainClicked" value="this" title="Copy This Attribute"/>
                    </li>

                    <li tabindex="0"class="fillItem"  afterCreate={this._addFillItem}>
                        <a ahref="#" data-dojo-attach-point="series" data-dojo-attach-event="click:_onFillSeriesClicked">Fill Series</a>
                        <div class="fillItem_content hide" data-dojo-attach-point="series_content">
                            <label for="fillStart">Start:</label>
                            <input type="number" step="2" value="1" data-dojo-attach-point="fillStart"/>
                            <label for="fillStart">Step:</label>
                            <input type="number" step="1" value="2" data-dojo-attach-point="fillStep"/>
                            <label class="col2">
                                <input type="radio" name="fillFrom" checked data-dojo-attach-point="fillFromStart"/>
                                From Start
                            </label>
                            <label class="col2">
                                <input type="radio" name="fillFrom"/>
                                From Selected
                            </label>
                            <input class="col2" type="button" value="Apply" data-dojo-attach-event="click:_onFillApplyClicked"/>
                        </div>
                    </li>
                </ul>
            </div>
        );
    }

    private _addDropDownBtn = (element: Element) => {
        this.dropDownButton = element as HTMLInputElement;
        this.own(on(this.dropDownButton, "click", event => {
            html.toggleClass(this.menuContent, "hide");
            if(!(html as any).hasClass(this.menuContent, "hide")) {
                this.parent.emit("openMenu", { menu: this.menuContent });
                this.getItemsForFeaturesCount();
            }
        }))
    }

    private _addMenuContent = (element: Element) => {
        this.menuContent = element as HTMLElement;
    }

    private _addLabelsItem = (element: Element) => {
        this.labelItem = element as HTMLElement;
    }

    private _addSortItem = (element: Element) => {
        this.sortItem = element as HTMLElement;
    }

    private _addFilterItem = (element: Element) => {
        this.filterItem = element as HTMLElement;
    }

    private _addCopyItem = (element: Element) => {
        this.copyItem = element as HTMLElement;
    }

    private _addFillItem = (element: Element) => {
        this.fillItem = element as HTMLElement;
    }


    private getItemsForFeaturesCount() {
        if (this.features.length > 1) {
            html.removeClass(this.sortItem, "hide");
            html.removeClass(this.copyItem, "hide");
            html.removeClass(this.fillItem, "hide");
        }
        else {
            html.addClass(this.sortItem, "hide");
            html.addClass(this.copyItem, "hide");
            html.addClass(this.fillItem, "hide");
        }
    }
}
export = DropDownItemMenu;