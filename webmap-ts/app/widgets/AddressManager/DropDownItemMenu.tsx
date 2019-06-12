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

    private dropDownButton: any;
    private menuContent: HTMLElement;

    constructor() {
        super();
    }

    postInitialize() {
    }

    render() {
        return (
            <div>
                <input type="image" src="../images/Burger.24.png" class="dropdown-button" aria-label="More Options" data-field={this.fieldName} afterCreate={this._addDropDownBtn} />

                <div class="dropdown-content hide" afterCreate={this._addMenuContent}>
                    <a ahref="#" class="menuItem" data-dojo-attach-point="labels" data-dojo-attach-event="click:_onMenuItemLabels">Show Labels</a>

                    <div class="sortItem menuItem" data-dojo-attach-point="sort">
                        <a ahref="#" data-dojo-attach-event="click:_onMenuItemSort">Sort On This</a>
                        <label title="Sort Order">
                            <input type="checkbox" data-dojo-attach-point="directionSort"/>
                            <img src="../images\icons_transp/ascending.black.18.png"/>
                        </label>
                    </div>
                    <a ahref="#" class="menuItem" data-dojo-attach-point="filter" data-dojo-attach-event="click:_onMenuItemFilter">Filter This Value</a>

                    <div class="copyToAllItem menuItem" data-dojo-attach-point="copy">
                        <a ahref="#" data-dojo-attach-event="click:_onMenuItemCopyToAll">Copy To All</a>
                        <input type="button" data-dojo-attach-point="copyDomain" data-dojo-attach-event="click:_onCopyDomainClicked" value="this" title="Copy This Attribute"/>
                    </div>
                    <div class="fillItem" data-dojo-attach-point="fillItem">
                        <a ahref="#" class="menuItem" data-dojo-attach-point="series" data-dojo-attach-event="click:_onFillSeriesClicked">Fill Series</a>
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
                    </div>
                </div>
            </div>
        );
    }

    private _addDropDownBtn = (element: Element) => {
        this.dropDownButton = element as HTMLInputElement;
        this.own(on(this.dropDownButton, "click", event => {html.toggleClass(this.menuContent, "hide")}))
    }

    private _addMenuContent = (element: Element) => {
        this.menuContent = element as HTMLElement;
    }
}
export = DropDownItemMenu;