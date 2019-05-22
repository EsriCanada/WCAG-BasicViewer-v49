/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property, aliasOf} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import domClass = require("dojo/dom-class");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import FeatureLayer = require("esri/layers/FeatureLayer");
import html = require("dojo/_base/html");
import Field = require("esri/layers/support/Field");
import UtilsViewModel = require("./UtilsViewModel");
import AddressManagerViewModel = require("./AddressManagerViewModel");
import Graphic = require("esri/Graphic");
import Feature = require("esri/widgets/Feature");
import Collection = require("esri/core/Collection");
import query = require("dojo/query");

@subclass("esri.widgets.AddressManager")
  class AddressManager extends declared(Widget) {
    @property()
    mapView: __esri.MapView;

    @property()
    config: any = {};

    @property()
    siteAddressPointLayer: FeatureLayer;

    @property()
    roadsLayer;

    @property()
    parcelsLayer;

    @property()
    roadFieldName: string;
    
    @property()
    @aliasOf("viewModel.addressPointFeatures")
    addressPointFeatures: Collection<Feature>;

    @property()
    @aliasOf("viewModel.addressPointFeaturesIndex")
    addressPointFeaturesIndex;

    @property()
    @aliasOf("viewModel.selectedAddressPointFeature")
    selectedAddressPointFeature: Feature;

    private clonePanel = null;

    private UtilsVM : UtilsViewModel;
    private viewModel : AddressManagerViewModel;
    
    private siteaddresspointLayerFields: any;
    private ignoreAttributes: any;
    private statusAttributes: any;
    private addressAttributes: any;
    private addressTable: any;
    private specialAttributes: any;
    private inputControls: any = {};
    private statusTable: any;
    private hiddenFields: any;
    private distanceBtn: HTMLElement;
    private zoomBtn: HTMLElement;
    private addressPointNavigatorDiv: HTMLElement;
    private addressPointIndexEl: HTMLElement;
    private addressPointCountEl: HTMLElement;
    private previousBtn: HTMLElement;
    private nextBtn: HTMLElement;
    private addressCopyAttributeNames: any[];

    constructor() {
        super(); 
    }

    postInitialize() {
        require([
            "dojo/text!./AddressManager.json"
        ], (config) => {
            this.config = JSON.parse(config);

            const getLayer = lang.hitch(this, function(alias:string):FeatureLayer {
                const layers = this.mapView.map.allLayers.items;
                // console.log("layers", layers);
                const result = layers.find((layer) => { 
                    return layer.title == this.config.services[alias]; 
                });
                return result;
            });
            this.siteAddressPointLayer = getLayer("siteaddresspoint");
            this.roadsLayer = getLayer("roadsegment");
            this.parcelsLayer = getLayer("parcel");
            this.viewModel = new AddressManagerViewModel();
            this.UtilsVM = new UtilsViewModel({mapView:this.mapView, roadsLayer: this.roadsLayer});

            this.addressPointFeatures.watch("length", (newValue) => {
                html.setStyle(this.zoomBtn, "display", newValue > 0 ? "": "none");
                html.setStyle(this.addressPointNavigatorDiv, "display", newValue > 1 ? "": "none");

                this.addressPointCountEl.innerHTML = this.addressPointFeatures.length+"";
            });
        });
    }

    render() {
        // console.log("mapView", this.mapView);
        return ( 
        <div afterCreate={this._addAddressManager} class="AddressManager">
            <div class="container" data-dojo-attach-point="AddressManagerContainer">

                <div class="toolbar">
                    <input id="addAddressPointBtn" type="image" src="../images/icons_transp/addAddress.bggray.24.png" class="button" afterCreate={this._addAddressButton} aria-label="Add Address Point" title="Add Address Point"></input>
                    <div class="dropdown_moreTools">
                        <input type="image" src="../images/icons_transp/Generate.bggray.24.png" class="button" afterCreate={this._addMoreToolsButton} aria-label="Clone Addresses" title="Clone Addresses"></input>
                        <div afterCreate={this._addClonePanel} ></div>
                    </div>
                    <input type="image" src="../images/icons_transp/parcels.bggray.24.png" class="button" afterCreate={this._addFillParcelsButton} data-dojo-attach-event="click:_onFillParcelClicked" aria-label="Fill Parcels" title="Fill Parcels"></input>

                    <div class="rightTools">
                        {/* <img src="../images/reload.gif" alt="Loading..."/> */}
                        <div class="addressPointNavigator" afterCreate={this._addAddressPointNavigator} style="display:none;">
                            <input type="image" src="../images/icons_transp/arrow.left.bgwhite.24.png" class="button-right showNav" title="Previous" afterCreate={this._addPreviousBtn}/>
                            <div aria-live="polite" aria-atomic="true">
                                <div class="showNav">
                                    <div style="width:0; height:0; overflow: hidden;">Address </div>
                                    <span afterCreate={this._addAddressPointIndex}>0</span>
                                    <span> of </span>
                                    <span afterCreate={this._addAddressPointCount}>0</span>
                                    <div style="width:0; height:0; overflow: hidden;">! </div>
                                </div>
                                <div data-dojo-attach-point="brokenRulesAlert" style="width:0; height:0px; overflow:hidden;"></div>
                            </div>
                            <input type="image" src="../images/icons_transp/arrow.right.bgwhite.24.png" class="button-right showNav" title="Next" afterCreate={this._addNextBtn}/>
                        </div>
                        <input type="image" src="../images/icons_transp/zoom.bgwhite.24.png" class="button-right showZoom" title="Zoom" style="display:none;" afterCreate={this._addZoomBtn}/>
                    </div>
                </div>

                <div afterCreate={this._addHiddenFields} style="display:none;"></div>

                <h1 class="addressTitle">[Full Address]</h1>
                <div class="tables" data-dojo-attach-point="AddressManager_Tables">

                    <table id="addressTable" afterCreate={this._addAddressTable}>
                        <caption>Address Fields</caption>
                    </table>
                    <table id="statusTable" afterCreate={this._addStatusTable}>
                        <caption>Status</caption>
                    </table>
                </div>
    
                <div class="footer">
                    <input type="button" id="sumbitAddressForm" data-dojo-attach-point="submitAddressForm" data-dojo-attach-event="onclick:_onSubmitAddressClicked" value="Save"/>
                    <input type="button" id="sumbitAddressAll" data-dojo-attach-point="submitAddressAll" data-dojo-attach-event="onclick:_onSubmitSaveAllClicked" value="Save All"/>
                    <input type="image" src="../images/icons_transp/verify.bgwhite.24.png" data-dojo-attach-point="verifyRules" class="verifyBtn" data-dojo-attach-event="onclick:_checkRules" title="Verify Address Point Record" style="vertical-align: bottom;" />
                    <input type="button" id="Cancel" class="rightBtn" data-dojo-attach-point="submitCancel" data-dojo-attach-event="onclick:_onCancelClicked" value="Cancel"/>
                    <input type="button" id="Delete" class="orangeBtn rightBtn" data-dojo-attach-point="submitDdelete" data-dojo-attach-event="onclick:_onDeleteClicked" value="Delete"/>
                </div>

            </div>        
        </div>
        );
    }

    private _addAddressManager = (element: Element) => {
        require([
            "esri/Map",
            "esri/views/MapView",
            "esri/core/watchUtils",
            "dojo/text!./AddressManager.json"
        ], (Map, MapView, watchUtils, config) => {
            this.config = JSON.parse(config);
            // console.log("config", this.config, this);

            const getLayer = lang.hitch(this, function(alias:string) {
                const layers = this.mapView.map.allLayers.items;
                // console.log("layers", layers);
                const result = layers.find((layer) => { 
                    return layer.title == this.config.services[alias]; 
                });
                return result;
            });

            this.siteAddressPointLayer = getLayer("siteaddresspoint");
            this.roadsLayer = getLayer("roadsegment");
            this.parcelsLayer = getLayer("parcel");
            this.roadFieldName = "fullname";

            this.UtilsVM = new UtilsViewModel({mapView:this.mapView, roadsLayer: this.roadsLayer});

            // console.log("this.config", this.config);
            this.ignoreAttributes = this.config.ignoreAttributes;
            this.specialAttributes = this.config.specialAttributes;
            this.addressAttributes = this.config.addressAttributes;
            this.statusAttributes = this.config.statusAttributes;

            let addressFilterAttributes = [...this._makeAddressTableLayout(), ...this._makeStatusTableLayout()];
            // console.log("addressFilterAttributes", addressFilterAttributes);

            this.addressCopyAttributeNames = [...addressFilterAttributes.filter(f => {
                if (this.specialAttributes.hasOwnProperty(f.name)) {
                    const attributes = this.specialAttributes[f.name];
                    return attributes.hasOwnProperty("menu") && (!attributes["menu"].hasOwnProperty("copy") || attributes["menu"]["copy"])
                }
            }).map(f => f.name)];
            addressFilterAttributes = addressFilterAttributes.filter(f => {
                let hidden = false;
                if (this.specialAttributes.hasOwnProperty(f.name)) {
                    const attributes = this.specialAttributes[f.name];
                    hidden = attributes.hasOwnProperty("hidden");
                    if (!hidden) {
                        hidden = attributes.hasOwnProperty("menu") && (attributes["menu"].hasOwnProperty("filter") && attributes["menu"]["filter"])
                    }
                }
                return !hidden && !this.ignoreAttributes.includes(f.name) && !this.ignoreAttributes.includes(f.alias);
            });
            console.log("inputControls", this.inputControls);

            // this._makeAddressTableLayout();

        });
     
    }

    private _addAddressButton = (element: Element) => {
        this.own(on(element, "click", this._activateButton));
        this.own(on(element, "click", lang.hitch(this, this._addSingleAddressClicked)));
    }

    private _addClonePanel = (element: Element) => {
        // console.log("element", element);
        require(["./ClonePanel"], ClonePanel =>{
            this.clonePanel = new ClonePanel({
                mapView: this.mapView,
                siteAddressPointLayer: this.siteAddressPointLayer,
                roadsLayer: this.roadsLayer,
                parcelsLayer : this.parcelsLayer,
                roadFieldName: this.roadFieldName,
                container: element as HTMLElement
            });
        });
    }

    private _addMoreToolsButton = (element: Element) => {
        this.own(on(element, "click", lang.hitch(this, this._toggleMoreToolsButton)));
    }

    private _addFillParcelsButton = (element: Element) => {
        this.own(on(element, "click", this._activateButton));
    }

    private _addAddressTable = (element: Element) => {
        this.addressTable = element as HTMLElement;
    }

    private _addHiddenFields = (element: Element) => {
        this.hiddenFields = element as HTMLElement;
    }

    private _addStatusTable = (element: Element) => {
        this.statusTable = element as HTMLElement;
    }

    private _activateButton(event) {
        // console.log("_activateButton", event);
        domClass.add(event.target, "active");
    }
    
    private _toggleMoreToolsButton(event) {
        if(this.clonePanel) {
            domClass.toggle(event.target, "active");
            this.clonePanel.show(domClass.contains(event.target, "active"));
        }
    }

    private _addSingleAddressClicked(event) {
        // https://developers.arcgis.com/javascript/3/sandbox/sandbox.html?sample=fl_featureCollection

        this.UtilsVM.ADD_NEW_ADDRESS().then(feature => {
            // // this._clearLabels();
            this.addressPointFeatures.push(feature as Feature);

            this._populateAddressTable(this.addressPointFeatures.length - 1);

            // map.setInfoWindowOnClick(true);
            html.removeClass(event.target, "active");
        });

    };

    private _addPreviousBtn = (element: Element) => {
        this.previousBtn = element as HTMLElement;

        this.own(on(this.previousBtn, "click", (event) => {
            const index = (this.addressPointFeatures.length + this.addressPointFeaturesIndex - 1) % this.addressPointFeatures.length;
            this._populateAddressTable(index);
        }));

    };

    private _addNextBtn = (element: Element) => {
        this.nextBtn = element as HTMLElement;

        this.own(on(this.nextBtn, "click", (event) => {
            const index = (this.addressPointFeaturesIndex + 1) % this.addressPointFeatures.length;
            this._populateAddressTable(index);
        }));
    };

    private _addZoomBtn = (element: Element) => {
        this.zoomBtn = element as HTMLElement;
    };

    private _addAddressPointNavigator = (element: Element) => {
        this.addressPointNavigatorDiv = element as HTMLElement;
    };

    private _addAddressPointIndex = (element: Element) => {
        this.addressPointIndexEl = element as HTMLElement;
    };

    private _addAddressPointCount = (element: Element) => {
        this.addressPointCountEl = element as HTMLElement;
    };

    private _makeAddressTableLayout() {
        this._showNavigator(false);

        this.getAddressFields();
        const addressFields = this.siteaddresspointLayerFields.filter(field => {
            return !this.ignoreAttributes.includes(field.name) && !this.statusAttributes.includes(field.name);
        });
        const fieldNames = addressFields.map(f => f.name);
        this.addressAttributes.forEach(attribute => {
            const field: Field = this.siteaddresspointLayerFields.find(field => field.name == attribute);
            if (field) {
                fieldNames.splice(fieldNames.indexOf(field.name), 1);
                this._addTableRow(field, this.addressTable);
            }
        });

        fieldNames.forEach(fieldName => {
            debugger;
            const attribute = this.siteaddresspointLayerFields.find(field => field.name == fieldName);
            const field = this.siteaddresspointLayerFields.find(field => field.name == attribute.name);
            if (field) {
                this._addTableRow(field, this.addressTable);
            }
        });

        return addressFields;
    }

    private _makeStatusTableLayout() {
        return [];
    }

    private _populateAddressTable(index: any) {
        this.UtilsVM._removeMarker(this.UtilsVM.SELECTED_ADDRESS_SYMBOL.name);

        this.addressPointFeaturesIndex = index;
        this.addressPointIndexEl.innerHTML = (this.addressPointFeaturesIndex + 1) + "";

        const feature = this.selectedAddressPointFeature = this.addressPointFeatures.toArray()[index];
        const graphic = new Graphic({geometry: (feature as any).geometry, symbol: this.UtilsVM.SELECTED_ADDRESS_SYMBOL});
        this.mapView.graphics.add(graphic as any);
    }

    
    private getAddressFields() {
        // console.log("ignoreAttributes", this.ignoreAttributes);
        const siteaddresspointLayerFields = this.siteAddressPointLayer.fields;
        // console.log("siteaddresspoint", this.siteAddressPointLayer, this.siteAddressPointLayer.title, siteaddresspointLayerFields);
        return this.siteaddresspointLayerFields = siteaddresspointLayerFields;
    }

    private _showNavigator(arg0: boolean) {
        // throw new Error("Method not implemented.");
    }


    private populateStatusTable() {
        let statusFields = [];
        this.statusAttributes.forEach(attribute => {
            const field = this.siteaddresspointLayerFields.find(field => field.name == attribute);
            if (field) {
                statusFields.push(field);
                this._addTableRow(field, this.statusTable);
            }
        });

        return statusFields;
        // console.log("inputControls", this.inputControls);
    }

    _addTableRow(field, table) {
        const input = this.getInputControl(field);
        this.inputControls[field.name] = input;

        if (input.type == "hidden") {
            html.place(input, this.hiddenFields);
            return;
        }

        const row = html.create("tr", {}, table);
        const head = html.create("th", { style: "vertical-align: top;" }, row);
        const labelContainer = html.create("div", {
            style: "display: inline-block; width: 100%;"
        }, head);
        const label = html.create("label", {
            for: field.name + "_input",
            innerHTML: field.alias + ":"
        }, labelContainer);
        const labelBtns = html.create("div", { style: "vertical-align: top;  float:right;" }, labelContainer);

        if (this.specialAttributes.hasOwnProperty(field.name)) {
            const attributes = this.specialAttributes[field.name];
            if (attributes.hasOwnProperty("clipboard")) {
                const clipboardBtn = html.create("input", {
                        type: "image",
                        src: "../images/icons_transp/clipboard.bgwhite.24.png", 
                        class: "rowImg",
                        title: "Copy to Clipboard",
                        "aria-label": "Copy to Clipboard",
                        "data-fieldname": field.name
                    },
                    labelBtns);
                this.own(on(clipboardBtn, "click",
                    event => {
                        // html.addClass(event.target, "activeBtn");
                        const fieldName = event.target.dataset.fieldname;
                        const input = this.inputControls[fieldName];
                        input.select();
                        document.execCommand("copy");
                        if (window.getSelection) { 
                            window.getSelection().removeAllRanges(); 
                        } else if ((document as any).selection) { 
                            (document as any).selection.empty(); 
                        }
                    }
                ));
            }
            if (attributes.hasOwnProperty("pickRoad")) {
                const pickRoadBtn = html.create("input", {
                        type: "image",
                        src: "../images/icons_transp/pickRoad2.bgwhite.24.png",
                        class: "rowImg",
                        title: "Pick Road",
                        "aria-label": "Pick Road"
                    },
                    labelBtns);
                this.own(on(pickRoadBtn, "click",
                    event => {
                        html.addClass(event.target, "activeBtn");

                        // (myUtils as any).PICK_ROAD(this.map, this.toolbar, this.roadSegmentLayer.layerObject)
                        //     .then(
                        //         street => {
                        //             if (this.setDirty(this.selectedAddressPointFeature, field.name, street.attributes.fullname)) {
                        //                 input.value = street.attributes.fullname;
                        //                 html.addClass(input, "dirty");

                        //                 const streetMarker = geometryEngine.buffer(street.geometry, 5, GeometryService.UNIT_METER);
                        //                 const streetGraphic = new Graphic(streetMarker, myUtils.BUFFER_SYMBOL);

                        //                 this.map.graphics.add(streetGraphic)

                        //                 setTimeout(() => this._removeMarker(myUtils.BUFFER_SYMBOL.name), 5000);

                        //             } else {
                        //                 html.removeClass(input, "remove");
                        //             };
                        //             this.map.setInfoWindowOnClick(true);
                        //             html.removeClass(event.target, "activeBtn");
                        //         },
                        //         err => {
                        //             console.log("PICK_ROAD", err);

                        //             this.map.setInfoWindowOnClick(true);
                        //             html.removeClass(event.target, "activeBtn");
                        //         }
                        //     );
                    }
                ));

                // }));

                this.distanceBtn = html.create("input", {
                        type: "image",
                        src: "../images/icons_transp/Distance.bgwhite.24.png",
                        class: "rowImg",
                        title: "Roads by Distance",
                        "aria-label": "Pick Road by Distance"
                    },
                    labelBtns);
                // this.own(on(this.distanceBtn, "click", event => {
                //     if (!this.pickupRoads) return;
                //     this.pickupRoads.set("open", !this.pickupRoads.open);
                //     this.pickupRoads.set("feature", this.selectedAddressPointFeature);
                //     if (this.pickupRoads.open) {
                //         html.addClass(event.target, "activeBtn");
                //     } else {
                //         html.removeClass(event.target, "activeBtn");
                //     }
                // }))
            }
            // if (attributes.hasOwnProperty("default")) {
            //     html.create("img", {
            //             src: "./widgets/AddressManager/images/Default.24.png",
            //             class: "rowImg",
            //             title: "Has Default",
            //         },
            //         labelBtns);
            // }
        }

        let cell = head;
        if (input.type == "textarea") {
            domAttr.set(cell, "colspan", "2");
            html.addClass(cell, "doubleCell");
            html.setStyle(labelContainer, "width", "calc(100% - 14px)");
        } else {
            cell = html.create("td", { style: "vertical-align: top;" }, row);
        }
        const cellContainer = html.create("div", {
            class: "AddressManager_Tables_dataCell-container"
        }, cell);
        domAttr.set(input, "data-alias", field.alias);
        html.place(input, cellContainer);
        html.addClass(input, "AddressManager_Tables_dataCell-input");

        // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_dropdown
        // https://w3bits.com/css-responsive-nav-menu/
        const dropdown = html.create("div", {
            class: "dropdown hide",
        }, cellContainer);
        const dropdownBtn = html.create("input", {
            type: "image",
            src: "./widgets/AddressManager/images/Burger.24.png",
            class: "AddressManager_Tables_dataCell-button",
            "aria-label": "More Options",
            "data-field": field.name
        }, dropdown);

        // if (this.specialAttributes.hasOwnProperty(field.name) && this.specialAttributes[field.name].hasOwnProperty("pickRoad")) {
        //     this.pickupRoads = new PickupRoads({
        //         map: this.map,
        //         roadsLayer: this.roadSegmentLayer,
        //         parcelsLayer: this.parcelLayer,
        //         input: input,
        //         selectionMade: (street) => {
        //             this.distanceBtn.click();
        //             if (this.setDirty(this.selectedAddressPointFeature, field.name, street)) {
        //                 html.addClass(input, "dirty");
        //             } else {
        //                 html.removeClass(input, "dirty");
        //             };
        //             this._inputChanged(field.name);
        //         }
        //     }, html.create("div", {}, cell));
        //     this.pickupRoads.startup();
        //     this.pickupRoads.set("open", false);
        // }

        // const rowStat = html.create("tr", { id: "statRow_" + field.name, style: "display:none;", "aria-live": true, "aria-atomic": true }, table);
        // const statRowCell = html.create("th", { id: "statRowCell_" + field.name, colSpan: 2 }, rowStat);
        // html.create("div", { id: "statistics_" + field.name, class: "statistics", innerHTML: "Statistics:" }, statRowCell);
        // // this.own(on(dropdownBtn, "click", lang.hitch(this, this._dropdownToggle)));
    }

    getInputControl(field) {
        let attributes = {};
        if (this.specialAttributes.hasOwnProperty(field.name)) {
            attributes = this.specialAttributes[field.name];
            // console.log("specialAttributes", field.name, attributes);
            if (attributes.hasOwnProperty("hidden")) {
                return html.create("input", {
                    type: "hidden",
                    id: field.name + "_input"
                })
            }
        }

        let input = null;

        const setSpecialAttributes = (input) => {
            if (input) {
                if (attributes.hasOwnProperty("readOnly")) {
                    if (input.type == "select") {
                        domAttr.set(input, "disabled", "true");
                    } else {
                        domAttr.set(input, "readonly", "true");
                    }
                }
                if (attributes.hasOwnProperty("required")) {
                    domAttr.set(input, "required", "true");
                }
                if (attributes.hasOwnProperty("format")) {
                    domAttr.set(input, "pattern", attributes["format"]);
                    this.own(on(input, "input", event => {
                        // console.log("input event", event);
                        const pattern = event.target.pattern;
                        const value = event.target.value;
                        if (!value.match(new RegExp(pattern))) {
                            let brokenRule = "Incorrect format.";
                            if (event.target.placeholder) {
                                brokenRule += "\nTry something like '" + event.target.placeholder + "'";
                            }
                            domAttr.set(event.target, "title", value + "\n" + brokenRule);
                            html.addClass(event.target, "brokenRule");
                        } else {
                            html.removeClass(event.target, "brokenRule");
                            domAttr.set(event.target, "title", value);
                        }
                    }));
                }
                if (attributes.hasOwnProperty("placeholder")) {
                    domAttr.set(input, "placeholder", attributes["placeholder"]);
                }
            }
        }

        switch (field.type) {
            case "esriFieldTypeString":
                if (field.hasOwnProperty("domain")) {
                    if (field.domain.type == "codedValue") {
                        input = html.create("select", {});
                        html.create("option", {
                            value: "",
                            innerHTML: ""
                        }, input);
                        field.domain.codedValues.forEach(codeValue => {
                            html.create("option", {
                                value: codeValue.code,
                                innerHTML: codeValue.name
                            }, input);
                        })
                    }
                } else {
                    if (!attributes.hasOwnProperty("multiline")) {
                        input = html.create("input", {
                            type: "text",
                            autocomplete: "off"
                        });
                    } else {
                        input = html.create("textarea", {
                            rows: attributes["multiline"]
                        });
                    }
                }
                break;
            case "esriFieldTypeDate":
                input = html.create("input", {
                    type: "date"
                });
                break;
            case "esriFieldTypeDouble":
                input = html.create("input", {
                    type: "number"
                });
                break;
            case "esriFieldTypeInteger":
            case "esriFieldTypeSmallInteger":
                if (field.hasOwnProperty("domain")) {
                    if (field.domain.type == "codedValue") {
                        input = html.create("select", {});
                        html.create("option", {
                            value: "",
                            innerHTML: ""
                        }, input);
                        field.domain.codedValues.forEach(codeValue => {
                            html.create("option", {
                                value: codeValue.code,
                                innerHTML: codeValue.name
                            }, input);
                        })
                    }
                } else {
                    input = html.create("input", {
                        type: "number"
                    });
                }
                break;
            default:
                input = html.create("input", {
                    type: "text",
                    autocomplete: "off"
                });
                break;
        };
        input.id = field.name + "_input";
        input["data-fieldName"] = field.name;
        setSpecialAttributes(input);
        on(input, "change", event => {
            // console.log("change", event, this.selectedAddressPointFeature);
            // this._inputChanged(event.target["data-fieldName"]);
        });
        return input;
    }


}


export = AddressManager;