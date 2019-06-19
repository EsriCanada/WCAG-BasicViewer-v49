/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property, aliasOf} from "esri/core/accessorSupport/decorators";
import { renderable, tsx } from "esri/widgets/support/widget";
import Widget = require("esri/widgets/Widget");

import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import html = require("dojo/_base/html");
import UtilsViewModel = require("./UtilsViewModel");
import AddressManagerViewModel = require("./AddressManagerViewModel");
import Collection = require("esri/core/Collection");
import Feature = require("esri/widgets/Feature");
import { Has } from "../../utils";
import { ApplicationConfig } from "ApplicationBase/interfaces";
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import FeatureLayer = require("esri/layers/FeatureLayer");


@subclass("esri.widgets.DropDownItemMenu")
class DropDownItemMenu extends declared(Widget) {
    @property()
    baseConfig: ApplicationConfig;

    @property()
    filters: any;

    @property()
    viewModel: AddressManagerViewModel;

    @property("readonly")
    parent;

    @property("readonly")
    input;

    @property("readonly")
    fieldName: string;

    @property("readonly")
    specialAttributes;

    @property()
    @aliasOf("viewModel.addressPointFeatures")
    addressPointFeatures: Collection<Feature>;

    @property()
    @aliasOf("viewModel.addressPointFeaturesIndex")
    addressPointFeaturesIndex;

    @property()
    @aliasOf("viewModel.selectedAddressPointFeature")
    selectedAddressPointFeature: Feature;

    @property()
    @aliasOf("viewModel.inputControls")
    inputControls;

    @property()
    @aliasOf("viewModel.addressCopyAttributeNames")
    addressCopyAttributeNames: any[];

    @property()
    @aliasOf("viewModel.siteAddressPointLayer")
    siteAddressPointLayer: FeatureLayer;

    @property()
    @aliasOf("viewModel.roadsLayer")
    roadsLayer: FeatureLayer;

    @property()
    @aliasOf("viewModel.parcelsLayer")
    parcelsLayer: FeatureLayer;

    @property()
    @aliasOf("viewModel.labelsGraphicsLayer")
    labelsGraphicsLayer: GraphicsLayer;

    @property("readonly")
    onMenuActionReady;

    @property("readonly")
    setDirty;

    // @property()
    // labelsGraphicsLayer;

    @property()
    utilsVM : UtilsViewModel;

    static lastFieldName: string;
    static LabelsGraphicsLayer;

    // private viewModel : AddressManagerViewModel;

    private dropDownButton: any;
    private menuContent: HTMLElement;
    private labelItem: HTMLElement;
    private sortItem: HTMLElement;
    private filterItem: HTMLElement;
    private copyItem: HTMLElement;
    private fillItem: HTMLElement;
    
    private directionSort: HTMLInputElement;
    private menuItemSort: HTMLAnchorElement;
    private menuItemCopyToAll: HTMLAnchorElement;
    private copyDomain: HTMLInputElement;
    private menuItemFilter: HTMLAnchorElement;

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
                        <a ahref="#" afterCreate={this._addMenuItemSort}>Sort On This</a>
                        <label title="Sort Order">
                            <input type="checkbox" style="display:none" afterCreate={this._addDirectionSort}/>
                            <img src="../images/icons_transp/ascending.black.18.png"/>
                        </label>
                    </li>

                    <li tabindex="0" class="copyToAllItem" afterCreate={this._addCopyItem}>
                        <a ahref="#" afterCreate={this._addMenuItemCopyToAll}>Copy To All</a>
                        <input type="button" afterCreate={this._addCopyDomain} value="this" title="Copy This Attribute"/>
                    </li>

                    <li tabindex="0" afterCreate={this._addFilterItem}>
                        <a ahref="#" afterCreate={this._addMenuItemFilter} >Filter This Value</a>
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
                this.getMenuItems();
            }
        }))
    }

    private _addMenuContent = (element: Element) => {
        this.menuContent = element as HTMLElement;
    }

    private _addLabelsItem = (element: Element) => {
        this.labelItem = element as HTMLElement;
        this.own(on(this.labelItem, "click", event => {
            if (this.addressPointFeatures.length <= 1) return;

            const show = DropDownItemMenu.LabelItemText == "Show Labels";
            // console.log("this.addressPointFeatures", this.addressPointFeatures);
            if (show) {
                this._showLabels();
            } else {
                this._clearLabels();
            }
            html.addClass(this.menuContent, "hide");

        }))
    }

    private _addSortItem = (element: Element) => {
        this.sortItem = element as HTMLElement;
    }

    private _addDirectionSort = (element: Element) => {
        this.directionSort = element as HTMLInputElement;
    }

    private _addMenuItemSort = (element: Element) => {
        this.menuItemSort = element as HTMLAnchorElement;
        this.own(on(this.menuItemSort, "click", event => {
            if (this.addressPointFeatures.length <= 1) return;
            const directionSort = this.directionSort.checked;

            const sortDescending = (a, b) => {
                const a1 = b.attributes[this.fieldName];
                const b1 = a.attributes[this.fieldName];
                return (a1 == Number(a1) && b1 == Number(b1)) ? (a1 - b1) : (a1 < b1);
            }

            const sortAscending = (a, b) =>  {
                const a1 = a.attributes[this.fieldName];
                const b1 = b.attributes[this.fieldName];
                return (a1 == Number(a1) && b1 == Number(b1)) ? (a1 - b1) : (a1 < b1);
            }
            this.addressPointFeatures.sort((directionSort ? sortDescending : sortAscending) as any);

            if(this.onMenuActionReady) {
                this.onMenuActionReady();
            }

            html.addClass(this.menuContent, "hide");

        }))
    }

    private _addMenuItemCopyToAll = (element: Element) => {
        this.menuItemCopyToAll = element as HTMLAnchorElement;
        this.own(on(this.menuItemCopyToAll, "click", event => {
            if (this.addressPointFeatures.length <= 1) return;

            if (this.copyDomain.value == "this") {
                const value = this.input.value;

                this.addressPointFeatures.forEach(feature => {
                    // if(feature != this.feature)
                    this.setDirty(this.input, feature, this.fieldName, value);
                })
            } else { // this.copyDomain == "all"
                const featureOrig = this.selectedAddressPointFeature;

                this.addressCopyAttributeNames.forEach(fieldName => {
                    if (this.inputControls.hasOwnProperty(fieldName)) {
                        const value = (featureOrig as any).attributes[fieldName];

                        this.addressPointFeatures.forEach(feature => {
                            // if (feature !== featureOrig) {
                                this.setDirty(this.input, feature, fieldName, value);
                            // }
                        })
                    }
                });
            }
            html.addClass(this.menuContent, "hide");
        }))
    }

    private _addCopyDomain = (element: Element) => {
        this.copyDomain = element as HTMLInputElement;
        this.own(on(this.copyDomain, "click", event => {
            const copyDomain = event.target;
            if (copyDomain.value == "this") {
                copyDomain.value = "all";
                copyDomain.title = "Copy All Attributes";
            } else {
                copyDomain.value = "this";
                copyDomain.title = "Copy This Attribute";
            }
        }))
    }

    private _addFilterItem = (element: Element) => {
        this.filterItem = element as HTMLElement;
    }

    private _addMenuItemFilter = (element: Element) => {
        this.menuItemFilter = element as HTMLAnchorElement;
        if(Has(this.baseConfig, "filter")) {
            this.own(on(this.menuItemFilter, "click", lang.hitch(this, function(event) {
                const menuItemFilter = event.target;
                const value = this.input.value;
                
                this.filters.AddFilterItem(this.siteAddressPointLayer, this.fieldName, value);
                html.addClass(this.menuContent, "hide");
            })))
        }
    }

    private _addCopyItem = (element: Element) => {
        this.copyItem = element as HTMLElement;
    }

    private _addFillItem = (element: Element) => {
        this.fillItem = element as HTMLElement;
    }


    private getMenuItems() {
        this.labelItem.firstChild.textContent = DropDownItemMenu.LabelItemText;
        
        const checkMenu = (value:string): boolean => ("menu" in this.specialAttributes && !(value in this.specialAttributes.menu) || this.specialAttributes.menu[value]);

        if(Has(this.baseConfig, "filter") && checkMenu("filter"))
            html.removeClass(this.filterItem, "hide");
        else 
            html.addClass(this.filterItem, "hide");

        if (this.addressPointFeatures.length > 1) {
            html.removeClass(this.sortItem, "hide");
            if(checkMenu("copy"))
                html.removeClass(this.copyItem, "hide");
            else 
                html.addClass(this.copyItem, "hide");

            if(checkMenu("series"))
                html.removeClass(this.fillItem, "hide");
            else 
                html.addClass(this.fillItem, "hide");
        }
        else {
            html.addClass(this.sortItem, "hide");
            html.addClass(this.copyItem, "hide");
            html.addClass(this.fillItem, "hide");
        }
    }

    private _showLabels = () => {
        if(DropDownItemMenu.lastFieldName != this.fieldName) {
            this._clearLabels();
            DropDownItemMenu.LabelItemText = this.labelItem.firstChild.textContent = "Hide Labels";
        }
        DropDownItemMenu.lastFieldName = this.fieldName;
        for (let i = 0; i < this.addressPointFeatures.length; i++) {
            const feature = (this.addressPointFeatures as any).items[i];
            // console.log("feature", feature);
            const graphic = {geometry: feature.geometry, symbol: this.utilsVM.GET_LABEL_SYMBOL(feature.attributes[this.fieldName])};
            // this.map.graphics.add(graphic);
            DropDownItemMenu.LabelsGraphicsLayer.add(graphic);
        }
    }

    private _clearLabels = () => {
        DropDownItemMenu.ClearLabels();
        DropDownItemMenu.LabelItemText = this.labelItem.firstChild.textContent = "Show Labels";
    }

    static ClearLabels = () => {
        DropDownItemMenu.LabelsGraphicsLayer.removeAll();
    }

    static LabelItemText = "Show Labels";

}
export = DropDownItemMenu;