/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");

import { tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.FilterTab")
  class FilterTab extends declared(Widget) {
    @property()
    mapView: __esri.MapView;

    @property()
    layer: __esri.FeatureLayer;

    @property()
    id: string;

    @property()
    tool: any;

    @property() 
    filters: any;

    private layerTitle : string;

    constructor() {
        super();
    }

    render() {
        const layerTitle = this.layer.title.NormalizeTitle();
        const badgeTip = i18n.badgesTips.someFilters;
        return (
            <div>
                <div class="FilterTab">
                    {/* <div afterCreate={this._addFilterTab}>{NormalizeTitle(this.layer.title)}</div> */}
                    <input id={`${this.id}_btn`} type="radio" name="FilterTabsGroup" onchange={this._filterTabChange}></input>
                    <label for={`${this.id}_btn`} aria-label={layerTitle} afterCreate={this._addedLabel}>
                        <span
                            tabindex="0"
                            onkeypress={this._filterTabKeyPress}
                            onfocus={this._filterTabFocus}
                            onblur={this._filterTabBlur}
                            aria-hidden="true"
                            title={layerTitle}>
                            {layerTitle}
                        </span>
                        <img
                            id={`${this.id}_img`}
                            src="images/someFilters.png"
                            class="setIndicator"
                            style="display:none;"
                            alt={badgeTip} title={badgeTip}
                            afterCreate={this._addedBadge}
                            />
                    </label>
                </div>

                <div class="tabContent" id={`${this.id}_page`} afterCreate={this._addFilterContent}>
                    <div class="filter-filterItem__filterAdd">
                        <label for="{this.id}_fieldCombo">{i18n.FilterTab.attribute}</label>
                        <select id="{this.id}_fieldCombo"autofocus tabindex="0" afterCreate={this._addFieldsCombo}></select>
                        
                        <button class="filter-filterItem__button esri-widget--button esri-icon-plus" 
                        aria-label={i18n.FilterTab.add} 
                        title={i18n.FilterTab.add} 
                        afterCreate={this._addInput}
                        />
                    </div>

                    <ul afterCreate={this._addFilterList}></ul>

                    <div class="filterButtons">
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.apply} afterCreate={this._addedApply}/>
                        <input type="button" class="fc bg pageBtn" value={i18n.FilterTab.ignore} afterCreate={this._addedIgnore}/>
                    </div>
                </div>

            </div>
        );
    }

    private _addFilterTab = (elemenet: Element) => {
        // console.log("layer", this.layer.title);
    }

    private ulFilterList : HTMLElement;
    private _addFilterList = (element:Element) => {
        this.ulFilterList = element as HTMLElement;
    }

    private filterTabContentPage: any;
    private _addFilterContent = (element: Element) => {
        this.filterTabContentPage = element;
        const filterTabsContent = dom.byId("filterTabsContent");
        domConstruct.place(element, filterTabsContent);
        domStyle.set(element, "display", "none");
    }

    private _filterTabChange = (event) => {
        // console.log("_filterTabChange", event.target, event.target.nextSibling);
        event.target.nextSibling.scrollIntoView({inline: "center", behavior: "smooth"});
        const activePageId = this.filterTabContentPage.id;
        const tabContentPages = query(".tabContent", dom.byId("filterTabsCOntent"));
        tabContentPages.forEach((page: Element) => {
            domStyle.set(page, "display", page.id === activePageId ? "": "none");
        })
    }

    private fieldsCombo: any;
    private _addFieldsCombo = (element: Element) => {
        // console.log("_addFieldsCombo", this.layer);
        this.fieldsCombo = element;
        this.layer.when(() => {
            // if(this.layer.popupTemplate) {
                const visibleFields = this.layer.popupTemplate.fieldInfos
                .filter(field => field && field.visible && field.fieldName && field.label);

                element.innerHTML = visibleFields.map(field => `<option value="${field.fieldName}">${field.label.NormalizeTitle()}</option>`)
                .join("");
            // } else {
            //     this.layer.fields.forEach((field) => {
            //         element.innerHTML += `<option value="${field.name}">${NormalizeTitle(field.alias)}</option>`;
            //     });
            // }
        });
    }

    private _filterTabKeyPress = (event) => {
        const label = event.target.parentNode;
        // console.log("_filterTabKeyPress", event, label);
        if(event.key == "Enter" || event.key == " ") {
            label.click();
        }
    }

    private _filterTabFocus = (event) => {
        const label = event.target.parentNode;
        // console.log("_filterTabFocus", event, label);
        // domStyle.set(label, "z-index", 20);
        domAttr.remove(label, "aria-hidden");
    }

    private _filterTabBlur = (event) => {
        const label = event.target.parentNode;
        // console.log("_filterTabBlur", event);
        // domStyle.set(label, "z-index", 10);
        domAttr.set(label, "aria-hidden", "true");
    }

    private FilterItems = new Array<any>();

    public _filterAdd = (fieldId: string, fieldValue?: any) => {
        this.layer.when((layer: __esri.FeatureLayer) => {
            // console.log("layer", layer);
            const field: __esri.Field = layer.fields.filter((field) => {return field.name == fieldId;})[0];
            // console.log("_filterAdd layer", layer, "field", field);
            require(["./filterItem"], (FilterItem) => { 
                const filterItem = new FilterItem({
                    layer: layer, 
                    field: field, 
                    tool: this.tool,
                    value: fieldValue,
                    container: this.ulFilterList
                });
                // this.filterList.appendChild(filterItem.domNode);
                // filterItem.startup(); 
                this.FilterItems.push(filterItem); 
                filterItem.own(filterItem.on("removeFilterItem", (id) => {
                    this.FilterItems.splice(this.FilterItems.indexOf(filterItem), 1);
                    if(this.FilterItems.length === 0) {
                        // this.filterIgnore();
                        this.getDefinitionExtensionExtent(layer, null);
                        this.hideBadge();
                    }
                }));
                // filterItem.domNode.focus();
            });
        })
    }
    
    private _addInput = (element: Element) => {
        this.own(on(element, "click", (event) => {
            this._filterAdd(this.fieldsCombo.value);
        }));
    }

    private badge : HTMLElement;
    private _addedBadge = (element: Element) => {
        this.badge = element as HTMLElement;
    }

    private label1 : HTMLElement;
    private _addedLabel = (element: Element) => {
        this.label1 = element as HTMLElement;
    }

    private _addedApply = (element: Element) => {
        this.own(on(element, "click", (event) => {
            // console.log("Apply", event, this);
            this.filterApply(event);
        }));
    }

    private showBadge = () => {
        this.filters.ShowFiltersOn(this.id);

        domStyle.set(this.badge, "display", "");
        // domStyle.set(this.label1, "box-shadow", "red 0px -2px 0px 2px inset");
    }

    private _addedIgnore = (element: Element) => {
        this.own(on(element, "click", (event) => {
            // console.log("Ignore", event, element);
            this.hideBadge();
            this.getDefinitionExtensionExtent(this.layer, null);
        }));
    }
    private hideBadge = () => {
        this.filters.HideFiltersOn(this.id);
        domStyle.set(this.badge, "display", "none");
        // domStyle.set(this.label1, "box-shadow", "dimgray 0px -2px 0px 2px inset");
    }

    public filterApply = (event) => {
        const exps = [];
        // console.log("FilterItems", this.FilterItems);
        this.FilterItems.filter((f) => { return f.active && !f.hasErrors; }).forEach((f : any) => {// 
            try {
                // console.log("F", f, f.FilterPart);
                const exp = f.FilterPart.getFilterExpresion();
                // console.log("E", exp);
                if(exp) {
                    exps.push(exp);
                }
            }
            catch (error) {
                console.error("filterApply", error);
            }
        })

        if(exps.length === 1) {
            this.showBadge();
            this.getDefinitionExtensionExtent(this.layer, exps[0]);
        } else if (exps.length >= 1) {
            let op ='';
            const inList = exps.reduce(function(previousValue, currentValue) {
                if(previousValue && previousValue!=='') 
                    op = ' AND ';
                return previousValue+")"+op+"("+currentValue;
            });
            this.showBadge();
            this.getDefinitionExtensionExtent(this.layer,"("+inList+")");
        } else {
            this.hideBadge();
            this.getDefinitionExtensionExtent(this.layer,'');
        }
    }

    private getDefinitionExtensionExtent = (layer : __esri.FeatureLayer, expression : string) => {
        // console.log("LayerDeffinition ", "'"+expression+"'");
        layer.definitionExpression = expression;
        const _query = this.layer.createQuery();
        _query.where = expression ? expression : "1=1";
        _query.outFields = [];
        _query.returnGeometry = true;
        this.layer.queryExtent(_query).then((results) => {
            // console.log("myExtent", results, _query);
            if(results) {
                if((results.extent.xmin === results.extent.xmax && results.extent.ymin === results.extent.ymax)) {
                    this.mapView.goTo({target: results.extent.center, zoom: 13});
                }
                else {
                    var ext = results.extent.expand(1.5);
                    this.mapView.goTo(ext);
                }
            }
        });
    }

}

export = FilterTab;
