/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property, aliasOf} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import html = require("dojo/_base/html");
import lang = require("dojo/_base/lang");
import on = require("dojo/on");
import domClass = require("dojo/dom-class");
import domAttr = require("dojo/dom-attr");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Field = require("esri/layers/support/Field");
import UtilsViewModel = require("./UtilsViewModel");
import AddressManagerViewModel = require("./AddressManagerViewModel");
import Graphic = require("esri/Graphic");
import Feature = require("esri/widgets/Feature");
import Collection = require("esri/core/Collection");
import query = require("dojo/query");
import geometryEngine = require("esri/geometry/geometryEngine");
import DropDownItemMenu = require("./DropDownItemMenu");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
// import AddressCompiler = require("./AddressCompiler");

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
    private submitDelete: HTMLElement;
    private x: HTMLInputElement;
    private y: HTMLInputElement;
    private submitAddressForm: HTMLElement;
    private submitAddressAll: HTMLElement;
    private submitCancel: HTMLElement;
    private verifyRules: HTMLElement;
    private brokenRulesAlert: HTMLElement;
    private displayBrokenRules: HTMLElement;
    private addressPointButton: HTMLElement;
    private moreToolsButton: HTMLElement;
    private addressTitle: HTMLElement;
    private selectDropDownBtn: HTMLElement;
    private selectDropDownDiv: HTMLElement;
    private addressCompiler: any;
    private labelsGraphicsLayer: any;
    private pickupRoads: any;

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
            
            this.labelsGraphicsLayer = new GraphicsLayer();
            this.mapView.map.layers.add(this.labelsGraphicsLayer);
            DropDownItemMenu.LabelsGraphicsLayer = this.labelsGraphicsLayer;

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
                    <input type="image" src="../images/icons_transp/addAddress.bggray.24.png" class="button" afterCreate={this._addAddressPointButton} aria-label="Add Address Point" title="Add Address Point"></input>
                    <div class="dropdown_moreTools">
                        <input type="image" src="../images/icons_transp/Generate.bggray.24.png" class="button" afterCreate={this._addMoreToolsButton} aria-label="Clone Addresses" title="Clone Addresses"></input>
                        <div afterCreate={this._addClonePanel} ></div>
                    </div>
                    <input type="image" src="../images/icons_transp/parcels.bggray.24.png" class="button" afterCreate={this._addFillParcelsButton} data-dojo-attach-event="click:_onFillParcelClicked" aria-label="Fill Parcels" title="Fill Parcels"></input>
                    <div afterCreate={this._addSelectDropDownBtn} ></div>

                    <div class="rightTools">
                        {/* <img src="../images/reload.gif" alt="Loading..."/> */}
                        <div class="addressPointNavigator" afterCreate={this._addAddressPointNavigator} style="display:none;">
                            <input type="image" src="../images/icons_transp/arrow.left.bgwhite.24.png" class="button-right showNav" title="Previous" afterCreate={this._addPreviousBtn}/>
                            <div aria-live="polite" aria-atomic="true">
                                <div class="showNav" style="margin: 0 4px;">
                                    <div style="width:0; height:0; overflow: hidden;">Address </div>
                                    <span afterCreate={this._addAddressPointIndex}>0</span>
                                    <span> of </span>
                                    <span afterCreate={this._addAddressPointCount}>0</span>
                                    <div style="width:0; height:0; overflow: hidden;">! </div>
                                </div>
                            </div>
                            <input type="image" src="../images/icons_transp/arrow.right.bgwhite.24.png" class="button-right showNav" title="Next" afterCreate={this._addNextBtn}/>
                        </div>
                        <input type="image" src="../images/icons_transp/zoom.bgwhite.24.png" class="button-right showZoom" title="Zoom" style="display:none;" afterCreate={this._addZoomBtn}/>
                    </div>
                </div>

                <div afterCreate={this._addHiddenFields} style="display:none;"></div>

                <h1 class="addressTitle" afterCreate={this._addAddressTitle}>[Full Address]</h1>
                <div class="tables" data-dojo-attach-point="AddressManager_Tables">
                
                    <table data-dojo-attach-point="locationTable">
                        <caption><h2>Location</h2></caption>
                        <tr>
                            <th>
                                <div><label for="x_input">x:</label>
                                    <div style="float:right;">
                                        <input type="image" src="../images/icons_transp/centroid.bgwhite.24.png" title="Centroid" aria-label="Place Address Point to Centroid" data-dojo-attach-event="onclick:_onCentroidClicked" class="rowImg"/>
                                        <input type="image" src="../images/icons_transp/movePoint.bgwhite.24.png" title="Move" aria-label="Move Address Point" data-dojo-attach-event="onclick:_onMoveAddressPointClicked" data-dojo-attach-point="moveAddressPoint" class="rowImg"/>
                                    </div>
                                </div>
                            </th>
                            <td>
                                <div class="dataCell-container">
                                    <input type="text" id="x_input" class="dataCell-input" afterCreate={this._addX}/>
                                    <div class="dropdown hide">
                                        <input type="image" src="../images/Burger.24.png" class="dropdown-button" aria-label="X coordinate" data-field="x" data-dojo-attach-event="click:_dropdownLocationToggle"/>
                                        <div class="dropdown-content hide" data-dojo-attach-point="menuLocationContent_x">
                                            <div class="sortItem">
                                                <a ahref="#" data-dojo-attach-point="sort_x" data-dojo-attach-event="click:_onMenuItemLocationSort" data-field="x">Sort On This</a>
                                                <label title="Sort Order">
                                                    <input type="checkbox" data-dojo-attach-point="directionSortOn_y" />
                                                    <img src="../images/icons_transp/ascending.black.18.png" />
                                                </label>
                                            </div>
                                            <a ahref="#" data-dojo-attach-point="centroidAll" data-dojo-attach-event="click:_onMenuItemCenterAll">Center All</a>
                                            <a ahref="#" data-dojo-attach-point="moveAll" data-dojo-attach-event="click:_onMenuItemMoveAll">Move All</a>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="y_input">y:</label></th>
                            <td>
                                <div class="dataCell-container">
                                    <input type="text" id="y_input" class="dataCell-input" afterCreate={this._addY}/>
                                    <div class="dropdown hide">
                                        <input type="image" src="../images/Burger.24.png" class="dropdown-button" aria-label="Y coordinate" data-field="y" data-dojo-attach-event="click:_dropdownLocationToggle"/>
                                        <div class="dropdown-content hide" data-dojo-attach-point="menuLocationContent_y">
                                            <div class="sortItem">
                                                <a ahref="#" data-dojo-attach-point="sort_y" data-dojo-attach-event="click:_onMenuItemLocationSort" data-field="y">Sort On This</a>
                                                <label title="Sort Order">
                                                    <input type="checkbox" data-dojo-attach-point="directionSortOn_y" />
                                                    <img src="../images/icons_transp/ascending.black.18.png" />
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    </table>

                    <table id="addressTable" afterCreate={this._addAddressTable}>
                        <caption><h2>Address Fields</h2></caption>
                    </table>
                    <table id="statusTable" afterCreate={this._addStatusTable}>
                        <caption><h2>Status</h2></caption>
                    </table>
                </div>
    
                <div afterCreate={this._addDisplayBrokenRules} class="displayBrokenRules hide">
                    <h1>Broken Rules</h1>
                    <ul afterCreate={this._addBrokenRulesAlert}></ul>
                    </div>
                <div class="footer footer5cells">
                    <input type="button" id="sumbitAddressForm" afterCreate={this._addSubmitAddressForm} style="justify-self: left;" data-dojo-attach-event="onclick:_onSubmitAddressClicked" value="Save"/>
                    <input type="button" id="sumbitAddressAll" afterCreate={this._addSubmitAddressAll} style="justify-self: left;" data-dojo-attach-event="onclick:_onSubmitSaveAllClicked" value="Save All"/>
                    <input type="image" src="../images/icons_transp/verify.bgwhite.24.png" alt="Broken Rules" afterCreate={this._addVerifyRules} style="justify-self: center;" class="verifyBtn" title="Display Broken Rules" />
                    <input type="button" id="Delete" afterCreate={this._addSubmitDelete} style="justify-self: right;" data-dojo-attach-event="onclick:_onDeleteClicked" value="Delete"/>
                    <input type="button" id="Cancel" afterCreate={this._addSubmitCancel} style="justify-self: right; grid-column-start: 5" data-dojo-attach-event="onclick:_onCancelClicked" value="Cancel"/>
                </div>

            </div>        
        </div>
        );
    }

//  <input type="checkbox" data-dojo-attach-point="directionSortOn_y" />
//  <img src="../images/icons_transp/ascending.black.18.png" /> */}

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
                if (f.name in this.specialAttributes) {
                    const attributes = this.specialAttributes[f.name];
                    return "menu" in attributes && (!("copy" in attributes.menu) || attributes.menu.copy)
                }
            }).map(f => f.name)];
            addressFilterAttributes = addressFilterAttributes.filter(f => {
                let hidden = false;
                if (f.name in this.specialAttributes) {
                    const attributes = this.specialAttributes[f.name];
                    hidden = "hidden" in attributes;
                    if (!hidden) {
                        hidden = ("menu" in attributes) && (("filter" in attributes.menu) && attributes.menu.filter)
                    }
                }
                return !hidden && !this.ignoreAttributes.includes(f.name) && !this.ignoreAttributes.includes(f.alias);
            });
            console.log("inputControls", this.inputControls);

            // this._makeAddressTableLayout();

            require(["./AddressCompiler"], AddressCompiler =>{
                this.addressCompiler = new AddressCompiler({
                    pattern: this.config.addressPattern,
                    inputControls: this.inputControls,
                    addressLayer: this.siteAddressPointLayer,
                    container: this.addressTitle
                });

                this.addressCompiler.watch("address", (newValue) => {
                    const fullAddrInput = this.inputControls["full_add"];
                    fullAddrInput.value = newValue;
                    this._setDirty(fullAddrInput, this.selectedAddressPointFeature, "full_add", newValue);
                })
            })

            this.on("openMenu", lang.hitch(this, function(event) {
                // console.log("openMenu", event);
                const menus = query(".dropdown-content");
                menus.forEach(menu => {
                    if (menu != event.menu) {
                        html.addClass(menu, "hide");
                    } else {
                        html.removeClass(menu, "hide");
                    }
                })
            }));
        });
    }

    private _addSelectDropDownBtn = (element: Element) => {
        // this.selectDropDownDiv = element as HTMLElement;
        require(["./DropDownButton"], DropDownButton =>{
            this.selectDropDownBtn = new DropDownButton({
                parent: this,
                items: [
                    {
                        src: "../images/icons_transp/pickAddress.bggray.24.png",
                        label: "Pick Single Address or Parcel",
                        callback: this._onPickAddressClicked
                    },
                    {
                        src: "../images/icons_transp/pickAddressRange.bggray.24.png",
                        label: "Select Parcels",
                        callback: this._onPickAddressRangeClicked
                    },
                    {
                        src: "../images/icons_transp/pickMultipleAddresses.bggray.24.png",
                        label: "Select Multiple Addresses",
                        // callback: event => lang.hitch(this, this._onPickMultipleAddressClicked(event))
                    }
                ],
            container: element as HTMLElement
            })
        })
    }

    private _onPickAddressClicked = (event) => {
        html.addClass(event.target, "active");

        // this._onCancelClicked(null);
        this.mapView.graphics.removeAll();
        // this._clearLabels();

        this.addressPointFeatures.removeAll();
        this.UtilsVM.PICK_ADDRESS_OR_PARCEL(this.siteAddressPointLayer, this.parcelsLayer).then(
            features => {
                html.removeClass(event.target, "active");
                this.addressPointFeatures.unshift(...(features as []));
                this._populateAddressTable(0)

                // this._showLoading(false);
                // this.map.setInfoWindowOnClick(true);
            }, err => {
                console.log("PICK_ADDRESS_OR_PARCEL", err);
                // this._showLoading(false);
                // this.map.setInfoWindowOnClick(true);
                html.removeClass(event.target, "active");
            });
    }

    private _onPickAddressRangeClicked = (event) => {
        // console.log("_onPickAddressRangeClicked", event, this);
        html.addClass(event.target, "active");
        this.mapView.graphics.removeAll();
        // this._clearLabels();

        this.UtilsVM.PICK_ADDRESS_FROM_PARCEL_RANGE(this.siteAddressPointLayer, this.parcelsLayer)
            .then(features => {
                html.removeClass(event.target, "active");
                this.addressPointFeatures.removeAll();
                this.addressPointFeatures.unshift(...(features as []));
                this._populateAddressTable(0);

                // this._showLoading(false);
                // this.mapView.popup.autoOpenEnabled = true; // ?
            }, err => {
                console.log("PICK_ADDRESS_FROM_PARCEL_RANGE", err);
                // this._onCancelClicked(null);

                // this._showLoading(false);
                // this.mapView.popup.autoOpenEnabled = true; // ?
                html.removeClass(event.target, "active");
            });
        }

    private _addAddressTitle = (element: Element) => {
        this.addressTitle = element as HTMLElement;
    }

    private _addAddressPointButton = (element: Element) => {
        this.addressPointButton = element as HTMLElement;
        this.own(on(element, "click", this._activateButton));
        this.own(on(element, "click", lang.hitch(this, this._addSingleAddressClicked)));
    }

    private _addClonePanel = (element: Element) => {
        // console.log("element", element);
        require(["./ClonePanel"], ClonePanel =>{
            this.clonePanel = new ClonePanel({
                parent: this,
                mapView: this.mapView,
                siteAddressPointLayer: this.siteAddressPointLayer,
                roadsLayer: this.roadsLayer,
                parcelsLayer: this.parcelsLayer,
                roadFieldName: this.roadFieldName,
                onClose: () => { html.removeClass(this.moreToolsButton, "active") },
                container: element as HTMLElement
            });
        });
    }

    private _addMoreToolsButton = (element: Element) => {
        this.moreToolsButton = element as HTMLElement;
        this.own(on(element, "click", lang.hitch(this, this._toggleMoreToolsButton)));
    }

    private _addFillParcelsButton = (element: Element) => {
        this.own(on(element, "click", this._activateButton));
    }

    private _addSubmitDelete = (element: Element) => {
        this.submitDelete = element as HTMLElement;
        this.own(on(element, "click", lang.hitch(this, this._onDeleteClicked)));
    }

    private _onDeleteClicked(event) {
        const btn = event.target;
        // debugger;
        if(domClass.contains(btn, "orangeBtn")) {
            // this._clearLabels();
            this._RemoveGraphic(this.selectedAddressPointFeature as any);
            this.addressPointFeatures.remove(this.selectedAddressPointFeature);
            this._populateAddressTable(0);
        }
    }

    private _RemoveGraphic(feature) {
        const layer = feature.layer;
        if(layer) {
            const geometry = feature.geometry;
            const selected = layer.graphics.find(g => g.geometry === geometry);
            if(selected) {
                layer.graphics.remove(selected);
            }
        }
    }

    private _addDisplayBrokenRules = (element: Element) => {
        this.displayBrokenRules = element as HTMLElement;
    }

    private _addVerifyRules = (element: Element) => {
        this.verifyRules = element as HTMLElement;
        this.own(on(this.verifyRules, "click", (event) => {
            html.toggleClass(this.displayBrokenRules, "hide");
        }))
    }

    private _addBrokenRulesAlert = (element: Element) => {
        this.brokenRulesAlert = element as HTMLElement;
    }

    private _addX = (element: Element) => {
        this.x = element as HTMLInputElement;
    }

    private _addY = (element: Element) => {
        this.y = element as HTMLInputElement;
    }
    
    private _addSubmitAddressForm = (element: Element) => {
        this.submitAddressForm = element as HTMLElement;
    }

    private _addSubmitAddressAll = (element: Element) => {
        this.submitAddressAll= element as HTMLElement;
    }

    private _addSubmitCancel = (element: Element) => {
        this.submitCancel = element as HTMLElement;
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
            // console.log("feature", feature);

            this._populateAddressTable(this.addressPointFeatures.length - 1);

            // this.mapView.popup.autoOpenEnabled = true; // ?
            html.removeClass(event.target, "active");
        },
        error => {
            console.error("ADD_NEW_ADDRESS", error);

            // this.mapView.popup.autoOpenEnabled = true; // ?
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
            const attribute = this.siteaddresspointLayerFields.find(field => field.name == fieldName);
            const field = this.siteaddresspointLayerFields.find(field => field.name == attribute.name);
            if (field) {
                this._addTableRow(field, this.addressTable);
            }
        });

        return addressFields;
    }

    private _makeStatusTableLayout() {
        let statusFields = [];
        this.statusAttributes.forEach(attribute => {
            const field = this.siteaddresspointLayerFields.find(field => field.name == attribute);
            if (field) {
                statusFields.push(field);
                this._addTableRow(field, this.statusTable);
            }
        });

        return statusFields;
    }

    private _populateAddressTable(index: any) {
        this.UtilsVM._removeMarker(this.UtilsVM.SELECTED_ADDRESS_SYMBOL.name);

        this.addressPointFeaturesIndex = index;
        const feature = this.selectedAddressPointFeature = this.addressPointFeatures.toArray()[index] as any;

        this.addressPointIndexEl.innerHTML = (this.addressPointFeaturesIndex + 1) + "";

        if(feature) {
            const graphic = new Graphic({geometry: feature.geometry, symbol: this.UtilsVM.SELECTED_ADDRESS_SYMBOL});
            this.mapView.graphics.add(graphic as any);

            this.x.value = (feature as any).geometry["x"];
            this.y.value = (feature as any).geometry["y"];

            if ("originalValues" in feature && "geometry" in feature.originalValues) {
                html.addClass(this.x, "dirty");
                html.addClass(this.y, "dirty");
            } else {
                html.removeClass(this.x, "dirty");
                html.removeClass(this.y, "dirty");
            };

            if ("attributes" in feature) {
                const attributes = feature.attributes
                if (this.config.title in attributes) {
                    // this.addressCompiler.set("address", feature.attributes[this.config.title]);
                }
                const canDelete = !("OBJECTID" in attributes) || !attributes["OBJECTID"];
                if (!canDelete) {
                    html.removeClass(this.submitDelete, "orangeBtn");
                } else {
                    html.addClass(this.submitDelete, "orangeBtn");
                }

                for (let fieldName in this.inputControls) {
                    if (fieldName in this.inputControls) {
                        const input = this.inputControls[fieldName];

                        if (fieldName in attributes) {
                            // if (input.type === "date") {
                            //     input.value = new Date(attributes[fieldName]).toInputDate()
                            // } else {
                                input.value = attributes[fieldName];
                            // }
                        } else {
                            input.value = null;
                        }
                        input.title = input.value;

                        if ("originalValues" in feature && fieldName in feature.originalValues && feature.originalValues[fieldName] != input.value) {
                            html.addClass(input, "dirty");
                        } else {
                            html.removeClass(input, "dirty");
                        };
                    }
                }
            }

            this.addressCompiler.evaluate(feature);

            const menuBtns = query(".dropdown");
            menuBtns.forEach(menu => {
                html.removeClass(menu, "hide");

            })

        } else {
            this._clearForm();
        }
        this._setDirtyBtns();
        this._checkRules(feature);
        // this._showLoading(false);
        // this.mapView.popup.autoOpenEnabled = true; // ?
    }

    private _clearForm() {
        // this._showFieldMenus(false);
        this.x.value = "";
        this.y.value = "";
        // this.mapView.popup.autoOpenEnabled = true; // ?

        for (let fieldName in this.inputControls) {
            if (fieldName in this.inputControls) {
                const input = this.inputControls[fieldName];
                input.value = null;
                html.removeAttr(input, "title");
                html.removeClass(input, "brokenRule");
            }
        }

        // const [addressTitle] = query(".addressTitle");
        if (this.addressTitle) {
            html.empty(this.addressTitle);
        }

        const menuBtns = query(".dropdown");
        menuBtns.forEach(menu => {
            html.addClass(menu, "hide");
        })

    }

    private _checkRules(feature) {
        const brokenRules = [];
        if(feature) {
            for (let fieldName in this.inputControls) {
                const input = this.inputControls[fieldName];
                const alias = html.getAttr(input, "data-alias");

                if (fieldName in this.specialAttributes) {
                    const fieldConfig = this.specialAttributes[fieldName];
                    domAttr.set(input, "title", input.value);
                    if ("required" in fieldConfig && fieldConfig["required"] && input.value.isNullOrWhiteSpace()) {
                        const brokenRule = "'" + alias + "' is required but not provided.";
                        brokenRules.push(brokenRule);
                        domAttr.set(input, "title", domAttr.get(input, "title") + "\n" + brokenRule);
                        html.addClass(input, "brokenRule");
                    } else {
                        html.removeClass(input, "brokenRule");
                        html.setAttr(input, "title", input.value);
                    }
                    if ("format"in fieldConfig) {
                        if (!input.value.match(new RegExp(fieldConfig.format))) {
                            let brokenRule = "'" + alias + "' has incorrect format.";
                            if ("placeholder" in fieldConfig) {
                                brokenRule += " (Try '" + fieldConfig.placeholder + "')";
                            }
                            brokenRules.push(brokenRule);
                            domAttr.set(input, "title", domAttr.get(input, "title") + "\n" + brokenRule);
                            html.addClass(input, "brokenRule");
                        } else {
                            html.removeClass(input, "brokenRule");
                            domAttr.set(input, "title", input.value);
                        }
                    }
                }
            }
        }

        html.removeClass(this.verifyRules, "active");
        // html.setStyle(this.brokenRulesAlert, "display", "none");
        this.brokenRulesAlert.innerHTML = "";
        this.verifyRules.title = "Verify Address Point Record";
        if (brokenRules.length > 0) {
            const messages = brokenRules.join("\n");
            this.verifyRules.title = messages;
            html.addClass(this.verifyRules, "active");
            // this.brokenRulesAlert.innerHTML = messages.replace(/\n/, "<br />");
            brokenRules.forEach(msg => {
                this.brokenRulesAlert.innerHTML += "<li>"+msg+"</li>";
            });
        } else {
            html.addClass(this.displayBrokenRules, "hide");
        }
    }

    // private onCheckRules(event) {
    //     if (this.addressPointFeatures.length === 0) return;
    //     this._checkRules(this.selectedAddressPointFeature);
    // }

    private isDirty(feature) {
        return "Dirty" in feature && feature.Dirty;
    }

    private _setDirtyBtns() {
        html.removeClass(this.submitAddressForm, "blueBtn");
        html.removeClass(this.submitAddressAll, "greenBtn");
        html.removeClass(this.submitDelete, "orangeBtn");
        html.removeClass(this.submitCancel, "blankBtn");
        if (this.addressPointFeatures.length > 0) {
            if (this.isDirty(this.selectedAddressPointFeature)) {
                html.addClass(this.submitAddressForm, "blueBtn");
                html.addClass(this.submitCancel, "blankBtn");
            }
        const attributes = (this.selectedAddressPointFeature as any).attributes;
        const canDelete = !attributes || !("OBJECTID" in attributes) || !attributes["OBJECTID"];
        if (canDelete) {
            html.addClass(this.submitDelete, "orangeBtn");
        }
        this.addressPointFeatures.forEach(feature => {
                if (this.selectedAddressPointFeature != feature && this.isDirty(feature)) {
                    html.addClass(this.submitAddressAll, "greenBtn");
                    html.addClass(this.submitCancel, "blankBtn");
                }
            })
        }
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
        const head = html.create("th", {}, row);
        const labelContainer = html.create("div", {}, head);
        const label = html.create("label", {
            for: field.name + "_input",
            innerHTML: field.alias + ":"
        }, labelContainer);
        const labelBtns = html.create("div", {}, labelContainer);

        if (field.name in this.specialAttributes) {
            const attributes = this.specialAttributes[field.name];
            if ("clipboard" in attributes) {
                const capsLockBtn = html.create("input", {
                    type: "image",
                    src: "../images/icons_transp/capsLock.bgwhite.24.png", 
                    class: "rowImg",
                    title: "Caps Lock",
                    "aria-label": "To Upercase",
                    "data-fieldname": field.name
                },
                labelBtns);
                this.own(on(capsLockBtn, "click",
                    event => {
                        html.toggleClass(capsLockBtn, "active");
                        this.addressCompiler.capsLock = domClass.contains(capsLockBtn, "active");
                    }
                ));
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
            if ("pickRoad" in attributes) {
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
                        html.addClass(event.target, "active");

                        this.UtilsVM.PICK_ROAD().then(
                            street => {
                                const fullname = (street as any).attributes.fullname
                                input.value = fullname;
                                this._setDirty(input, this.selectedAddressPointFeature, field.name, fullname)

                                this._inputChanged(field.name);
                                html.removeClass(event.target, "active");
                            },
                            err => {
                                console.log("PICK_ROAD", err);

                                // this.mapView.popup.autoOpenEnabled = true; // ?
                                html.removeClass(event.target, "active");
                            }
                        );
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

            // if ("default" in attributes) {
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
            cell = html.create("td", {}, row);
        }
        const cellContainer = html.create("div", {
            class: "dataCell-container"
        }, cell);
        domAttr.set(input, "data-alias", field.alias);
        html.place(input, cellContainer);
        html.addClass(input, "dataCell-input");

        // https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_js_dropdown
        // https://w3bits.com/css-responsive-nav-menu/
        const dropdown = html.create("div", {
            class: "dropdown hide",
        }, cellContainer);

        require(["./DropDownItemMenu"], DropDownItemMenu =>{
            const dropdownBtn = new DropDownItemMenu({
                parent: this,
                fieldName: field.name,
                specialAttributes: this.specialAttributes[field.name],
                addressPointFeatures: this.addressPointFeatures,
                // labelsGraphicsLayer: this.labelsGraphicsLayer,
                utilsVM: this.UtilsVM,
                onSortReady: () => this._populateAddressTable(0),
                container: dropdown
            });
        });

        if (field.name in this.specialAttributes && "pickRoad" in this.specialAttributes[field.name]) {
            require(["./PickupRoads"], PickupRoads =>{
                this.pickupRoads = new PickupRoads({
                    mapView: this.mapView,
                    utils: this.UtilsVM,
                    roadsLayer: this.roadsLayer,
                    parcelsLayer: this.parcelsLayer,
                    input: input,
                    selectionMade: (street) => {
                        this.distanceBtn.click();
                        this._setDirty(this.selectedAddressPointFeature, field.name, street, input);
                        this._inputChanged(field.name);
                    },
                    container:html.create("div", {}, cell)
                });
                // this.pickupRoads.open = false;
                this.own(on(this.distanceBtn, "click", event => {
                    if(this.addressPointFeatures.length <=0) return;
                    this.pickupRoads.feature = this.selectedAddressPointFeature;
                    this.pickupRoads.open = !this.pickupRoads.open;
                    if (this.pickupRoads.open) {
                        html.addClass(event.target, "active");
                    } else {
                        html.removeClass(event.target, "active");
                    }
                }))
            })
        }

        // const rowStat = html.create("tr", { id: "statRow_" + field.name, style: "display:none;", "aria-live": true, "aria-atomic": true }, table);
        // const statRowCell = html.create("th", { id: "statRowCell_" + field.name, colSpan: 2 }, rowStat);
        // html.create("div", { id: "statistics_" + field.name, class: "statistics", innerHTML: "Statistics:" }, statRowCell);
        // // this.own(on(dropdownBtn, "click", lang.hitch(this, this._dropdownToggle)));
    }

    getInputControl(field) {
        let attributes = {};
        if (field.name in this.specialAttributes) {
            attributes = this.specialAttributes[field.name];
            // console.log("specialAttributes", field.name, attributes);
            if ("hidden" in attributes) {
                return html.create("input", {
                    type: "hidden",
                    id: field.name + "_input"
                })
            }
        }

        let input = null;

        const setSpecialAttributes = (input) => {
            if (input) {
                if ("readOnly" in attributes) {
                    if (input.type == "select") {
                        domAttr.set(input, "disabled", "true");
                    } else {
                        domAttr.set(input, "readonly", "true");
                    }
                }
                if ("required" in attributes) {
                    domAttr.set(input, "required", "true");
                }
                if ("format" in attributes) {
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
                if ("placeholder" in attributes) {
                    domAttr.set(input, "placeholder", attributes["placeholder"]);
                }
            }
        }

        // console.log("field", field.name, field.type, field.domain);
        if (("domain" in field) && field.domain) {
            console.log()
            if (field.domain.type == "coded-value") {
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
            switch (field.type) {
                case "string":
                    if (!("multiline" in attributes)) {
                        input = html.create("input", {
                            type: "text",
                            autocomplete: "off"
                        });
                    } else {
                        input = html.create("textarea", {
                            rows: attributes["multiline"]
                        });
                    }
                    break;
                case "date":
                    input = html.create("input", {
                        type: "date"
                    });
                    break;
                case "double":
                    input = html.create("input", {
                        type: "number"
                    });
                    break;
                case "integer":
                case "small-integer":
                    input = html.create("input", {
                        type: "number"
                    });
                    break;
                default:
                    input = html.create("input", {
                        type: "text",
                        autocomplete: "off"
                    });
                    break;
            };
        }
        input.id = field.name + "_input";
        input["data-fieldName"] = field.name;
        setSpecialAttributes(input);
        on(input, "change", event => {
            this._inputChanged(event.target["data-fieldName"]);
        });
        return input;
    }

    _inputChanged = (fieldName: string) => {
        const input = this.inputControls[fieldName];
        let value = input.value;
        if (fieldName in this.specialAttributes) {
            const fieldConfig = this.specialAttributes[fieldName];
            const isUpperCase = "uppercase" in fieldConfig && fieldConfig.uppercase;
            if (isUpperCase) {
                input.value = value = value.toUpperCase();
            }
        }
        this._setDirty(input, this.selectedAddressPointFeature, fieldName, value);
            
        if (this.addressCompiler.fields.includes(fieldName)) {
            this.addressCompiler.evaluate(this.selectedAddressPointFeature);
        }
    }

    _setDirty = (input, feature, fieldName, value) => {
        if (!input || !feature) return false;
        if (fieldName == "geometry" || feature.attributes[fieldName] != value) {
            if (!("originalValues" in feature)) {
                feature.originalValues = {};
            }
            if (!(fieldName in feature.originalValues)) {
                feature.originalValues[fieldName] = fieldName == "geometry" ? JSON.parse(JSON.stringify(feature.geometry)) : feature.attributes[fieldName];
            }

            if (fieldName != "geometry") {
                if(!(fieldName in feature.originalValues)) {
                    feature.originalValues[fieldName] = feature.attributes[fieldName];
                }
                feature.attributes[fieldName] = value;
            }
            const nullToBlankOrValue = (value:string) => {return value == null ? "" : value; };
            // feature.Dirty 
            const dirtyField = nullToBlankOrValue(feature.originalValues[fieldName]) != nullToBlankOrValue(value);

            if(dirtyField) {
                html.addClass(input, "dirty");
                feature.Dirty = true;
            } else {
                html.removeClass(input, "dirty");
                feature.Dirty = false;
                for(let i=0; i < this.inputControls.length; i++) {
                    const inp = this.inputControls[i];
                    if(domClass.contains(inp, "dirty")) {
                        feature.Dirty = true;
                        break;
                    }
                }
            };

            this._setDirtyBtns();

            if (feature === this.selectedAddressPointFeature) {
                this._checkRules(feature);
            }
        }
        // return this.isDirty(feature);
    }

}


export = AddressManager;