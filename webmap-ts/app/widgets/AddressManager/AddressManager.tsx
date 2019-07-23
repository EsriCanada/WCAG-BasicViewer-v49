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

import i18n = require("dojo/i18n!./nls/resources");
import i18nCommon = require("dojo/i18n!esri/nls/common");
import FeatureLayer = require("esri/layers/FeatureLayer");
import Field = require("esri/layers/support/Field");
import UtilsViewModel = require("./UtilsViewModel");
import AddressManagerViewModel = require("./AddressManagerViewModel");
import SaveConfirmBox = require("./SaveConfirmBox");
import Graphic = require("esri/Graphic");
import Feature = require("esri/widgets/Feature");
import Collection = require("esri/core/Collection");
import query = require("dojo/query");
import geometryEngine = require("esri/geometry/geometryEngine");
import DropDownItemMenu = require("./DropDownItemMenu");
import GraphicsLayer = require("esri/layers/GraphicsLayer");
import { ApplicationConfig } from "ApplicationBase/interfaces";
import Point = require("esri/geometry/Point");
import watchUtils = require("esri/core/watchUtils");
import Draw = require("esri/views/draw/Draw");
import { resolve } from "path";
import { rejects } from "assert";

@subclass("esri.widgets.AddressManager")
  class AddressManager extends declared(Widget) {
    @property()
    baseConfig: ApplicationConfig;

    @property()
    filters: any;

    @property()
    mapView: __esri.MapView;

    @property()
    config: any = {};

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

    @property()
    @aliasOf("viewModel.newAddressGraphicsLayer")
    newAddressGraphicsLayer: GraphicsLayer;

    @property()
    @aliasOf("viewModel.labelsGraphicsLayer")
    labelsGraphicsLayer: GraphicsLayer;

    @property()
    @aliasOf("viewModel.parcelsGraphicLayer")
    parcelsGraphicLayer: GraphicsLayer;

    @property()
    @aliasOf("viewModel.inputControls")
    inputControls;

    @property()
    @aliasOf("viewModel.addressCopyAttributeNames")
    addressCopyAttributeNames: any[];

    private clonePanel = null;

    private UtilsVM : UtilsViewModel;
    private viewModel : AddressManagerViewModel;
    
    private siteaddresspointLayerFields: any;
    private ignoreAttributes: any;
    private statusAttributes: any;
    private addressAttributes: any;
    private addressTable: any;
    private specialAttributes: any;
    private statusTable: any;
    private hiddenFields: any;
    private distanceBtn: HTMLElement;
    private zoomBtn: HTMLElement;
    private addressPointNavigatorDiv: HTMLElement;
    private addressPointIndexEl: HTMLElement;
    private addressPointCountEl: HTMLElement;
    private previousBtn: HTMLElement;
    private nextBtn: HTMLElement;
    private submitDelete: HTMLElement;
    private x: HTMLInputElement;
    private y: HTMLInputElement;
    private saveBtn: HTMLElement;
    private saveAllBtn: HTMLElement;
    private cancelBtn: HTMLElement;
    private verifyRules: HTMLElement;
    private brokenRulesAlert: HTMLElement;
    private displayBrokenRules: HTMLElement;
    private addressPointButton: HTMLElement;
    private moreToolsButton: HTMLElement;
    private addressTitle: HTMLElement;
    private selectDropDownBtn: HTMLElement;
    private selectDropDownDiv: HTMLElement;
    private addressCompiler: any;
    private pickupRoads: any;
    private centroidBtn: HTMLInputElement;
    private pickParcels_draw: Draw;
    private freeLine: any;
    private selectedGeometries: Collection<__esri.Geometry>;
    private menuFieldName: string;
    private centerAll: HTMLElement;
    private moveAddressPointBtn: HTMLElement;
    private moveAllItem: HTMLElement;
    private saveConfirmBox: SaveConfirmBox;

    constructor() {
        super(); 
    }

    postInitialize() {
        require([
            "dojo/text!./AddressManager.json"
        ], (config) => {
            this.config = JSON.parse(config);
            this.viewModel = new AddressManagerViewModel();

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
            
            this.newAddressGraphicsLayer = new GraphicsLayer();
            this.mapView.map.layers.add(this.newAddressGraphicsLayer);

            this.labelsGraphicsLayer = new GraphicsLayer();
            this.mapView.map.layers.add(this.labelsGraphicsLayer);
            DropDownItemMenu.LabelsGraphicsLayer = this.labelsGraphicsLayer;

            this.parcelsGraphicLayer = new GraphicsLayer();
            this.mapView.map.add(this.parcelsGraphicLayer);
            
            this.parcelsLayer.when(pLayer => {
                watchUtils.whenTrue(this.mapView, "stationary", () => {
                    this.parcelsGraphicLayer.removeAll();
                    const q = pLayer.createQuery();
                    q.outFields = ["OBJECTID"];
                    q.where = "1=1";
                    q.geometry = this.mapView.extent;
                    q.spatialRelationship = "intersects";
                    q.returnGeometry = true;
            
                    pLayer.queryFeatures(q).then(result => {
                        // console.log("result", result)
                        const {features} = result;
                        const geometries = features.map(f => {
                            const g = f.geometry;
                            g.id = f.attributes["OBJECTID"];
                            return g;
                        })
                        // console.log("geometries", geometries);
                        const graphics = geometries.map(g => new Graphic({geometry: g, symbol: {
                            type:"simple-fill",
                            color: [0, 0, 0, 0],
                            outline: {
                                color:[0, 0, 0, 0],
                                width:0,
                                style:"solid"
                            }} as any})
                        );
                        // console.log("graphics", graphics);
                        this.parcelsGraphicLayer.addMany(graphics)
                    })
                })
            })
        

            // this.UtilsVM = new UtilsViewModel({mapView:this.mapView, roadsLayer: this.roadsLayer, newAddressLayer: this.newAddressGraphicsLayer});

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
                    <input type="image" src="../images/icons_transp/parcels.bggray.24.png" class="button" afterCreate={this._addFillParcelsBtn} aria-label="Fill Parcels" title="Fill Parcels"></input>
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

                <h1 class="addressTitle" afterCreate={this._addAddressTitle}></h1>
                <div class="tables" data-dojo-attach-point="AddressManager_Tables">
                
                    <table data-dojo-attach-point="locationTable">
                        <caption><h2>{i18n.addressManager.location}</h2></caption>
                        <tr>
                            <th>
                                <div><label for="x_input">x</label>
                                    <div style="float:right;">
                                        <input type="image" src="../images/icons_transp/centroid.bgwhite.24.png" title="Centroid" aria-label="Place Address Point to Centroid" afterCreate={this._addCentroidBtn} class="rowImg"/>
                                        <input type="image" src="../images/icons_transp/movePoint.bgwhite.24.png" title="Move" aria-label="Move Address Point" afterCreate={this._addMoveAddressPointBtn} data-dojo-attach-point="moveAddressPoint" class="rowImg"/>
                                    </div>
                                </div>
                            </th>
                            <td>
                                <div class="dataCell-container">
                                    <input type="text" id="x_input" class="dataCell-input" afterCreate={this._addX}/>
                                    <div class="dropdown hide">
                                        <input type="image" src="../images/Burger.24.png" class="dropdown-button" aria-label="X coordinate" data-field="x" afterCreate={this._addMenuToggleX}/>
                                        <div class="dropdown-content hide" id="menuLocationContent_x">
                                            <div class="sortItem">
                                                <a ahref="#" data-dojo-attach-point="sort_x" afterCreate={this._addMenuItemLocationSort} data-field="x">Sort On This</a>
                                                <label title="Sort Order">
                                                    <input type="checkbox" style="display:none;" id="directionSortOn_x" />
                                                    <img src="../images/icons_transp/ascending.black.18.png" />
                                                </label>
                                            </div>
                                            <a ahref="#" data-dojo-attach-point="centroidAll" afterCreate={this._addCenterAll}>Center All</a>
                                            <a ahref="#" data-dojo-attach-point="moveAll" afterCreate={this._addMoveAllItem}>Move All</a>
                                        </div>
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <th><label for="y_input">y</label></th>
                            <td>
                                <div class="dataCell-container">
                                    <input type="text" id="y_input" class="dataCell-input" afterCreate={this._addY}/>
                                    <div class="dropdown hide">
                                        <input type="image" src="../images/Burger.24.png" class="dropdown-button" aria-label="Y coordinate" data-field="y" afterCreate={this._addMenuToggleY}/>
                                        <div class="dropdown-content hide" id="menuLocationContent_y">
                                            <div class="sortItem">
                                                <a ahref="#" data-dojo-attach-point="sort_y" afterCreate={this._addMenuItemLocationSort}  data-field="y">Sort On This</a>
                                                <label title="Sort Order">
                                                    <input type="checkbox" style="display:none;" id="directionSortOn_y"/>
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
                        <caption><h2>{i18n.addressManager.addressFields}</h2></caption>
                    </table>
                    <table id="statusTable" afterCreate={this._addStatusTable}>
                        <caption><h2>{i18n.addressManager.status}</h2></caption>
                    </table>
                </div>
    
                <div afterCreate={this._addDisplayBrokenRules} class="displayBrokenRules hide">
                    <h1>{i18n.addressManager.brokenRules}</h1>
                    <ul afterCreate={this._addBrokenRulesAlert}></ul>
                </div>

                <div class="footer footer5cells">
                    <input type="button" id="sumbitAddressForm" afterCreate={this._addSaveBtn} style="justify-self: left;" value={i18n.addressManager.save}/>
                    <input type="button" id="sumbitAddressAll" afterCreate={this._addSaveAllBtn} style="justify-self: left;" value={i18n.addressManager.saveAll}/>
                    <input type="image" src="../images/icons_transp/verify.bgwhite.24.png" alt={i18n.addressManager.displayBrokenRules} afterCreate={this._addVerifyRules} style="justify-self: center;" class="verifyBtn" title={i18n.addressManager.displayBrokenRules} />
                    <input type="button" id="Delete" afterCreate={this._addSubmitDelete} style="justify-self: right;" value={i18nCommon.delete}/>
                    <input type="button" id="Cancel" afterCreate={this._addCancelBtn} style="justify-self: right; grid-column-start: 5" value={i18nCommon.cancel}/>
                </div>

            </div> 
            <div afterCreate={this._addConfirmBoxNode}>
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

            this.UtilsVM = new UtilsViewModel({mapView:this.mapView, roadsLayer: this.roadsLayer, newAddressLayer: this.newAddressGraphicsLayer});

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
                        callback: this._onPickMultipleAddressClicked
                    }
                ],
            container: element as HTMLElement
            })
        })
    }

    private _addMenuToggleX = (element) => {
        this.own(on(element, "click", this.onLocationMenuClick))
    }
    
    private _addMenuToggleY = (element) => {
        this.own(on(element, "click", this.onLocationMenuClick))
    }

    private onLocationMenuClick = event => {
        const menuLocationContent = html.byId("menuLocationContent_"+event.target.dataset["field"]);
        html.toggleClass(menuLocationContent, "hide");
        if(!(html as any).hasClass(menuLocationContent, "hide")) {
            this.emit("openMenu", { menu: menuLocationContent });
        }
    }
    
    private _onPickAddressClicked = (event) => {
        html.addClass(event.target, "active");

        // this._onCancelClicked(null);
        this.mapView.graphics.removeAll();
        DropDownItemMenu.ClearLabels();

        this.addressPointFeatures.removeAll();
        this.UtilsVM.PICK_ADDRESS_OR_PARCEL(this.siteAddressPointLayer, this.parcelsLayer).then(
            features => {
                html.removeClass(event.target, "active");
                this.addressPointFeatures.unshift(...(features as []));
                this._populateAddressTable(0)

                // this._showLoading(false);
                // this.map.setInfoWindowOnClick(true);
            }, err => {
                console.error("PICK_ADDRESS_OR_PARCEL", err);
                // this._showLoading(false);
                // this.map.setInfoWindowOnClick(true);
                html.removeClass(event.target, "active");
            });
    }

    private _onPickAddressRangeClicked = (event) => {
        html.addClass(event.target, "active");
        this.UtilsVM.PICK_PARCELS(this.parcelsGraphicLayer).then(
            selectedGeometries => {
                if (selectedGeometries.length > 0) {
                    this.UtilsVM.GET_ADDRESS_IN_GEOMETRIES(selectedGeometries, this.siteAddressPointLayer)
                    .then(
                        features => {
                            this.addressPointFeatures.removeAll();
                            this.addressPointFeatures.unshift(...(features as []));
                            this._populateAddressTable(0);
                            html.removeClass(event.target, "active");
                        }, error => {
                            html.removeClass(event.target, "active");
                            console.log("Pick parcels", error);
                        })
                    }
                else {
                    html.removeClass(event.target, "active");
                    console.error("Pick parcels - No Parcels");
                }
            },
            error => {
                html.removeClass(event.target, "active");
                console.error("Select parcels", error);
            }
        )
    }

    private _onPickMultipleAddressClicked = event => {
        html.addClass(event.target, "active");

        require(["./CursorToolTip"], CursorToolTip => {
            const cursorTooltip = CursorToolTip.getInstance(this.mapView, i18n.addressManager.selectAddressLaso);

            this.UtilsVM.PICK_ADDRESSES(this.siteAddressPointLayer).then(
                addresses => {
                    CursorToolTip.Close();
                    html.removeClass(event.target, "active");

                    this._cancelFeatures();
                    this._clearForm();
                    this.addressPointFeatures.unshift(...(addresses as []));
                    this._populateAddressTable(0);
                },
                error => {
                    CursorToolTip.Close();
                    html.removeClass(event.target, "active");

                    if(error) {
                        console.error("PICK_ADDRESSES", error)
                    }
                }
            )
        })
    }

    private _addAddressTitle = (element: Element) => {
        this.addressTitle = element as HTMLElement;
    }

    private _addAddressPointButton = (element: Element) => {
        this.addressPointButton = element as HTMLElement;
        this.own(on(element, "click", event => {
            // https://developers.arcgis.com/javascript/3/sandbox/sandbox.html?sample=fl_featureCollection

            domClass.add(event.target, "active");
            require(["./CursorToolTip"], CursorToolTip => {
                const cursorTooltip = CursorToolTip.getInstance(this.mapView, i18n.addressManager.clickForNewAddress);
        
                this.UtilsVM.ADD_NEW_ADDRESS().then(feature => {
                    DropDownItemMenu.ClearLabels();
                    this.addressPointFeatures.push(feature as Feature);
                    // console.log("feature", feature);
        
                    this._populateAddressTable(this.addressPointFeatures.length - 1);
        
                    // this.mapView.popup.autoOpenEnabled = true; // ?
                    html.removeClass(event.target, "active");
                    cursorTooltip.close();
                },
                error => {
                    console.error("ADD_NEW_ADDRESS", error);
        
                    // this.mapView.popup.autoOpenEnabled = true; // ?
                    html.removeClass(event.target, "active");
                    cursorTooltip.close();
                })
            });
        }))
    }

    private _addClonePanel = (element: Element) => {
        // console.log("element", element);
        require(["./ClonePanel"], ClonePanel =>{
            this.clonePanel = new ClonePanel({
                parent: this,
                mapView: this.mapView,
                addressManagerVM: this.viewModel,
                siteAddressPointLayer: this.siteAddressPointLayer,
                roadsLayer: this.roadsLayer,
                parcelsLayer: this.parcelsLayer,
                roadFieldName: this.roadFieldName,
                onClose: () => { 
                    html.removeClass(this.moreToolsButton, "active");
                    if(this.addressPointFeatures.length > 0) {
                        this._populateAddressTable(0);
                    }
                },
                container: element as HTMLElement
            });
        });
    }

    private _addMoreToolsButton = (element: Element) => {
        this.moreToolsButton = element as HTMLElement;
        this.own(on(element, "click", lang.hitch(this, this._toggleMoreToolsButton)));
    }

    private _addFillParcelsBtn = (element: Element) => {
        this.own(on(element, "click", event => {
            html.addClass(event.target, "active");
            this.UtilsVM.PICK_PARCELS(this.parcelsGraphicLayer).then(selectedGeometries => {
                this.addressPointFeatures.removeAll();
                selectedGeometries.forEach(geo => {
                    const centroid = this.UtilsVM.GetCentroidCoordinates(geo) as Point;
                    const feature = {
                        geometry: centroid, 
                        symbol: this.UtilsVM.NEW_ADDRESS_SYMBOL,
                        attributes: { "status": 0 },
                        originalValues: {"status" : ""},
                        Dirty: true
                    } as any;
                    // this.mapView.graphics.add(feature);
                    feature.layer = this.newAddressGraphicsLayer;
                    this.newAddressGraphicsLayer.add(feature);
                    this.addressPointFeatures.push(feature);
                });
                this._populateAddressTable(0);
                html.removeClass(event.target, "active");
            }, error => {
                html.removeClass(event.target, "active");
                console.error(error);
            })
        }));
    }

    private _addSubmitDelete = (element: Element) => {
        this.submitDelete = element as HTMLElement;
        this.own(on(element, "click", lang.hitch(this, this._onDeleteClicked)));
    }

    private _onDeleteClicked(event) {
        const btn = event.target;
        // debugger;
        if(domClass.contains(btn, "orangeBtn")) {
            DropDownItemMenu.ClearLabels();
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
        this.own(on(this.displayBrokenRules, "dblclick", event => {
            html.addClass(this.displayBrokenRules, "hide");
        }))
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
    
    private _addSaveBtn = (element: Element) => {
        this.saveBtn = element as HTMLElement;
        this.own(on(this.saveBtn, "click", event => {
            if(!(html as any).hasClass(event.target, "blueBtn")) return;

            this.saveConfirmBox.showApplyAll(false);
            this.saveFeature(this.selectedAddressPointFeature);
        }))
    }

    private _addSaveAllBtn = (element: Element) => {
        this.saveAllBtn = element as HTMLElement;
        this.own(on(this.saveAllBtn, "click", async event => {
            html.addClass(this.saveAllBtn, "active");
            this.saveConfirmBox.showApplyAll(true);
            for(let i = 0; i< this.addressPointFeatures.length; i++) {
                await this.saveFeature(await this._populateAddressTable(i));
            }
            html.removeClass(this.saveAllBtn, "active");
        }))
    }

    private saveFeature = async (feature: any) => {
        const brokenRules = this._checkRules(feature);
        // console.log("Broken Rules", brokenRules.join("\n"));
        await this.saveConfirmBox.Ask(feature.attributes.status == 1 ? null : brokenRules)
        .then(async response => {
            if(response == SaveConfirmBox.SAVE_SAFE) {
                feature.attributes.status = 1;
            }
            let applyWhat = {};
            if (this.canDelete(feature)) {
                applyWhat["addFeatures"] = [feature];
            }
            else {
                applyWhat["updateFeatures"] = [feature];
            }
            await this.siteAddressPointLayer.applyEdits(applyWhat)
            .then(results => {
                const { addFeatureResults, updateFeatureResults } = results;
                const [addedFeature] = addFeatureResults;
                if (addedFeature) {
                    if (addedFeature.error) {
                        throw (addedFeature.error);
                    }
                    this._RemoveGraphic(feature);
                    feature.attributes['OBJECTID'] = addedFeature['objectId'];
                    if (this.addressPointFeatures.length > 0 && this.selectedAddressPointFeature == feature) {
                        (html.byId('OBJECTID_input') as HTMLInputElement).value = addedFeature['objectId'];
                    }
                    const q = this.siteAddressPointLayer.createQuery();
                    q.outFields = ["*"];
                    q.objectIds = [addedFeature['objectId']];
                    q.returnGeometry = true;
                    this.siteAddressPointLayer.queryFeatures(q).then(({ features }) => {
                        if (features && features.length === 1) {
                            this.mapView.graphics.remove(feature);
                            feature.attributes = features[0].attributes;
                            this.clearDirty(feature);
                            this._populateAddressTable(this.addressPointFeaturesIndex);
                        }
                    });
                }
                const [updatedFeature] = updateFeatureResults;
                if (updatedFeature) {
                    if (updatedFeature.error) {
                        throw (updatedFeature.error);
                    }
                    this.clearDirty(feature);
                    delete feature.originalValues;
                    this._populateAddressTable(this.addressPointFeaturesIndex);
                }
                // this._setDirtyBtns();
            })
            .catch(error => {
                console.error(`Save [ applyEdits ]: ${error}`);
            });
        })
        .catch(error => {
            if(error != SaveConfirmBox.CANCEL) {
                console.error("Save", error);
            }
        });
    }

    private _addConfirmBoxNode = (element: Element) => {
        // this.confirmBoxNode = element as HTMLElement;
        this.saveConfirmBox = new SaveConfirmBox({container:element as HTMLElement});
    }

    private _addCancelBtn = (element: Element) => {
        this.cancelBtn = element as HTMLElement;
        this.own(on(this.cancelBtn, "click", event => {
            if(!domClass.contains(event.target, "blankBtn")) return;

            this.mapView.graphics.removeAll();
            this.newAddressGraphicsLayer.removeAll(); // ?
            this.addressPointFeatures.forEach((feature: any) => {
                if (this.canDelete(feature)) {
                    this._RemoveGraphic(feature);
                }
            });
            this._cancelFeatures();
            this._clearForm();
            this._setDirtyBtns();
        }))
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

    private _cancelFeatures() {
        if(this.addressPointFeatures.length <= 0) return;

        this.addressPointFeatures.forEach((feature: any) => {
            if (!this.canDelete(feature)) {
                if ("originalValues" in feature) {
                    for (const fieldName in feature.originalValues) {
                        if (fieldName != "geometry") {
                            feature.attributes[fieldName] = feature.originalValues[fieldName];
                            html.removeClass(this.inputControls[fieldName], "dirty");
                        }
                        else {
                            // feature._layer.suspend();
                            feature.geometry = feature.originalValues.geometry;
                            // feature._layer.resume();
                        }
                    }
                    this.clearDirty(feature);
                }
            }
            // else {
                // if (this.canDelete(feature)) {
                //     this._RemoveGraphic(feature);
            // }
        });
        
        DropDownItemMenu.ClearLabels();

        this.addressPointFeatures.removeAll();
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

        this.own(on(this.zoomBtn, "click", (event) => {
            if(this.addressPointFeatures.length > 0) {
                const [buffer] = geometryEngine.buffer(this.addressPointFeatures.map(a => (a as any).geometry).toArray(), [15], "meters", true) as any;
                this.mapView.goTo(buffer);

                const bufferGr = new Graphic({ geometry: buffer, symbol: this.UtilsVM.BUFFER_SYMBOL})
                this.mapView.graphics.add(bufferGr);
                setTimeout(() => {this.mapView.graphics.remove(bufferGr);}, 500);
            }
        }))
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

    private _addCentroidBtn = (element: Element) => {
        this.centroidBtn = element as HTMLInputElement;
        this.own(on(this.centroidBtn, "click", event => {
            if (!this.addressPointFeatures || this.addressPointFeatures.length == 0) return;
                const btn = event.target;
                html.addClass(btn, "active");

                const feature = this.selectedAddressPointFeature;

                const q = this.parcelsLayer.createQuery();
                q.outFields = ["OBJECTID"];
                q.where = "1=1";
                q.geometry = (feature as any).geometry;
                q.spatialRelationship = "intersects";
                q.returnGeometry = true;

                this.parcelsLayer.queryFeatures(q).then(
                ({features}) => {
                    html.removeClass(btn, "active");
                    const [geo] = features.map(f => f.geometry);
                    if (geo) {
                        const centroid = this.UtilsVM.GetCentroidCoordinates(geo) as Point;

                        if((feature as any).geometry.x != centroid.x || (feature as any).geometry.y != centroid.y) {
                            this.UtilsVM.SHOW_ARROW((feature as any).geometry, centroid);

                            this.x.value = centroid.x.toString();
                            this.y.value = centroid.y.toString();

                            this._setDirty([this.x, this.y], feature, "geometry", centroid);

                            this.UtilsVM._removeMarker(this.UtilsVM.SELECTED_ADDRESS_SYMBOL.name);
                            const graphic = new Graphic({geometry: (feature as any).geometry, symbol: this.UtilsVM.SELECTED_ADDRESS_SYMBOL});
                            this.mapView.graphics.add(graphic);
                        }
                    }
                },
                err => {
                    html.removeClass(btn, "active");
                    console.log("Centroid Error", err);
                })
        }))
    };

    private _addCenterAll = (element: Element) => {
        this.centerAll = element as HTMLElement;
        this.own(on(this.centerAll, "click", event => {
            if(this.addressPointFeatures.length < 1) return;

            this.addressPointFeatures.forEach(f => {
                const address = f as any;

                const q = this.parcelsLayer.createQuery();
                q.outFields = ["OBJECTID"];
                q.where = "1=1";
                q.geometry = address.geometry;
                q.spatialRelationship = "intersects";
                q.returnGeometry = true;

                this.parcelsLayer.queryFeatures(q).then(
                ({features}) => {
                    const [geo] = features.map(f => f.geometry);
                    if (geo) {
                        const centroid = this.UtilsVM.GetCentroidCoordinates(geo) as Point;

                        if(address.geometry.x != centroid.x || address.geometry.y != centroid.y) {
                            this.UtilsVM.SHOW_ARROW(address.geometry, centroid);
                            this._setDirty([centroid.x, centroid.y], address, "geometry", centroid);
                        }
                    }
                })
            })

            this._populateAddressTable(0);
        }))
    }

    private _addMoveAddressPointBtn = (element: Element) => {
        this.moveAddressPointBtn = element as HTMLElement;
        this.own(on(this.moveAddressPointBtn, "click", event => {
            if (!this.addressPointFeatures || this.addressPointFeatures.length == 0) return;
            html.addClass(event.target, "active");
            require(["./CursorToolTip"], CursorToolTip => {
                const cursorTooltip = CursorToolTip.getInstance(this.mapView, i18n.addressManager.clickEndMove);

                const feature = this.selectedAddressPointFeature as any;
                let g = feature.geometry;
                if("originalValues" in feature && "geometry" in feature.originalValues) {
                    g = feature.originalValues.geometry;
                }

                this.UtilsVM.MOVE_POINT([g]).then(
                    ([result]) => {
                        const feature = this.selectedAddressPointFeature as any;
                        // console.log("move result", result);
                        html.removeClass(event.target, "active");
                        CursorToolTip.Close();

                        this.x.value = result.x.toString();
                        this.y.value = result.y.toString();

                        this._setDirty([this.x, this.y], feature, "geometry", result);
                        const selectGraphic = new Graphic({geometry: feature.geometry, symbol: this.UtilsVM.SELECTED_ADDRESS_SYMBOL});
                        this.mapView.graphics.add(selectGraphic);
                    },
                    error =>  {
                        console.log("move error", error);
                        html.removeClass(event.target, "active");
                        CursorToolTip.Close();
                        const selectGraphic = new Graphic({geometry: feature.geometry, symbol: this.UtilsVM.SELECTED_ADDRESS_SYMBOL});
                        this.mapView.graphics.add(selectGraphic);
                    }
                )
            })

        }))
    }

    private _addMoveAllItem = (element: Element) => {
        this.moveAllItem = element as HTMLElement;
        this.own(on(this.moveAllItem, "click", event => {
            if (!this.addressPointFeatures || this.addressPointFeatures.length == 0) return;
            
            html.addClass(event.target, "active");
            require(["./CursorToolTip"], CursorToolTip => {
                const cursorTooltip = CursorToolTip.getInstance(this.mapView, i18n.addressManager.clickEndMove);

                const gs = this.addressPointFeatures.slice(this.addressPointFeaturesIndex).map(f => {
                    const feature = f as any;
                    let g = feature.geometry;
                    if("originalValues" in feature && "geometry" in feature.originalValues) {
                        g = feature.originalValues.geometry;
                    }
                    return g;
                }).toArray();

                const feature = this.selectedAddressPointFeature as any;
                this.UtilsVM.MOVE_POINT(gs).then(
                    results => {
                        // console.log("move result", result);
                        html.removeClass(event.target, "active");
                        CursorToolTip.Close();

                        results.forEach((result:Point, i:number) => {
                            const feature = this.addressPointFeatures.getItemAt(this.addressPointFeaturesIndex + i);
                            this._setDirty([this.x, this.y], feature, "geometry", result);
                        })
                        this._populateAddressTable(this.addressPointFeaturesIndex);
                },
                    error =>  {
                        console.log("move error", error);
                        html.removeClass(event.target, "active");
                        CursorToolTip.Close();
                        const selectGraphic = new Graphic({geometry: feature.geometry, symbol: this.UtilsVM.SELECTED_ADDRESS_SYMBOL});
                        this.mapView.graphics.add(selectGraphic);
                    }
                )

            })
        }))
    }


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

    private _populateAddressTable(index: any) : Promise<any> {
        return new Promise((resolve, reject) => {
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

                if ("attributes" in feature && feature.attributes) {
                    const attributes = feature.attributes
                    // if (this.config.title in attributes) {
                    //     // this.addressCompiler.set("address", feature.attributes[this.config.title]);
                    // }
                    if (!this.canDelete(feature)) {
                        html.removeClass(this.submitDelete, "orangeBtn");
                    } else {
                        html.addClass(this.submitDelete, "orangeBtn");
                    }

                    for (let fieldName in this.inputControls) {
                        if (fieldName in this.inputControls) {
                            const input = this.inputControls[fieldName];

                            if (fieldName in attributes) {
                                if (input.type === "date") {
                                    input.value = new Date(attributes[fieldName]).toInputDate()
                                } else {
                                    input.value = attributes[fieldName];
                                }
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

                    this.addressCompiler.evaluate(feature);
                }

                const menuBtns = query(".dropdown");
                menuBtns.forEach(menu=> {
                    const field = ((menu as HTMLElement).children[0] as HTMLElement).dataset["field"];
                    if((field !="x" && field !="y") || this.addressPointFeatures.length > 1) {
                        html.removeClass(menu, "hide");
                    } else {
                        html.addClass(menu, "hide");
                    }
                })
                this._setDirtyBtns();
                this._checkRules(feature);

                resolve(feature)
            } else {
                this._clearForm();
                reject("No features selected");
            }
            // this._showLoading(false);
            // this.mapView.popup.autoOpenEnabled = true; // ?
        })
    }

    private _clearForm() {
        // this._showFieldMenus(false);
        this.x.value = "";
        this.y.value = "";
        html.removeClass(html.byId("x_input"), "dirty");
        html.removeClass(html.byId("y_input"), "dirty");

        // this.mapView.popup.autoOpenEnabled = true; // ?

        for (let fieldName in this.inputControls) {
            if (fieldName in this.inputControls) {
                const input = this.inputControls[fieldName];
                input.value = null;
                html.removeAttr(input, "title");
                html.removeClass(input, "brokenRule");
                html.removeClass(this.inputControls[fieldName], "dirty");
            }
        }

        html.removeClass(this.submitDelete, "orangeBtn");

        // const [addressTitle] = query(".addressTitle");
        if (this.addressTitle) {
            html.empty(this.addressTitle);
        }

        const menuBtns = query(".dropdown");
        menuBtns.forEach(menu => {
            html.addClass(menu, "hide");
        })

        this.UtilsVM.selectedParcelsGraphic = null;

        html.removeClass(this.verifyRules, "active");
        this.brokenRulesAlert.innerHTML = "";
        this.verifyRules.title = i18n.addressManager.displayBrokenRules;
    }

    private _checkRules(feature) {
        html.removeClass(this.verifyRules, "active");
        this.brokenRulesAlert.innerHTML = "";
        this.verifyRules.title = i18n.addressManager.displayBrokenRules;
        //"Verify Address Point Record";

        const brokenRules = [];
        if(feature) {
            for (let fieldName in this.specialAttributes) {
                const input = this.inputControls[fieldName];
                if(input) {
                    const alias = html.getAttr(input, "data-alias");

                    const fieldConfig = this.specialAttributes[fieldName];
                    domAttr.set(input, "title", input.value);
                    if ("required" in fieldConfig && fieldConfig["required"] && input.value.isNullOrWhiteSpace()) {
                        const brokenRule = //"'{0}' is required but not provided."
                        i18n.addressManager.requiredNotProvided.format(alias);
                        brokenRules.push(brokenRule);
                        domAttr.set(input, "title", domAttr.get(input, "title") + "\n" + brokenRule);
                        html.addClass(input, "brokenRule");
                    } else {
                        html.removeClass(input, "brokenRule");
                        html.setAttr(input, "title", input.value);
                    }
                    if ("format"in fieldConfig) {
                        if (!input.value.match(new RegExp(fieldConfig.format))) {
                            let brokenRule = i18n.addressManager.incorrectFormat.format(alias);
                            if ("placeholder" in fieldConfig) {
                                brokenRule += i18n.addressManager.tryFormat.format(fieldConfig.placeholder);
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

            if (brokenRules.length > 0) {
                const messages = brokenRules.join("\n");
                this.verifyRules.title = messages;
                html.addClass(this.verifyRules, "active");
                brokenRules.forEach(msg => {
                    this.brokenRulesAlert.innerHTML += "<li>"+msg+"</li>";
                });
                return brokenRules;
            } else {
                html.addClass(this.displayBrokenRules, "hide");
                return brokenRules;
            }
        } else {
            return null;
        }
    }

    private isDirty(feature) {
        return "Dirty" in feature && feature.Dirty;
    }

    private _setDirtyBtns() {
        html.removeClass(this.saveBtn, "blueBtn");
        html.removeClass(this.saveAllBtn, "greenBtn");
        html.removeClass(this.submitDelete, "orangeBtn");
        html.removeClass(this.cancelBtn, "blankBtn");
        if (this.addressPointFeatures.length > 0) {
            html.addClass(this.cancelBtn, "blankBtn");
            if (this.isDirty(this.selectedAddressPointFeature)) {
                html.addClass(this.saveBtn, "blueBtn");
                // html.addClass(this.submitCancel, "blankBtn");
            }
        if (this.canDelete(this.selectedAddressPointFeature)) {
            html.addClass(this.submitDelete, "orangeBtn");
        }
        this.addressPointFeatures.forEach(feature => {
                if (this.selectedAddressPointFeature != feature && this.isDirty(feature)) {
                    html.addClass(this.saveAllBtn, "greenBtn");
                    // html.addClass(this.submitCancel, "blankBtn");
                }
            })
        }
    }

    private canDelete = feature => {
        const attributes = feature.attributes;
        return !attributes || !("OBJECTID" in attributes) || !attributes["OBJECTID"];
    }

    private clearDirty = feature => {
        feature.Dirty = false;
        delete feature.originalValues;
        for(let key in this.inputControls) {
            html.removeClass(this.inputControls[key], "dirty");
        };
        html.removeClass(html.byId("x_input"), "dirty");
        html.removeClass(html.byId("y_input"), "dirty");
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
            innerHTML: field.alias
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

                        this.UtilsVM.PICK_ROAD()
                        .then(
                            street => {
                                const fullname = (street as any).attributes.fullname
                                input.value = fullname;
                                this._setDirty(input, this.selectedAddressPointFeature, field.name, fullname)

                                this._inputChanged(field.name);
                                html.removeClass(event.target, "active");
                        })
                        .catch(err => {
                            console.log("PICK_ROAD", err);

                            // this.mapView.popup.autoOpenEnabled = true; // ?
                            html.removeClass(event.target, "active");
                        });
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
                baseConfig: this.baseConfig,
                filters: this.filters,
                parent: this,
                input: input,
                viewModel: this.viewModel,
                fieldName: field.name,
                specialAttributes: this.specialAttributes[field.name],
                utilsVM: this.UtilsVM,
                onMenuActionReady: () => this._populateAddressTable(0),
                setDirty: this._setDirty,
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
                        this._setDirty(input, this.selectedAddressPointFeature, field.name, street);
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
        if(!feature.attributes) {
            feature["attributes"] = {};
        }
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
            } else {
                if(!("geometry" in feature.originalValues)) {
                    feature.originalValues.geometry = feature.geometry;
                }
                feature.geometry = value;
            }
            const nullToBlankOrValue = (value:string) => {return value == null ? "" : value; };
            // feature.Dirty 
            const dirtyField = nullToBlankOrValue(feature.originalValues[fieldName]) != nullToBlankOrValue(value);

            let inputs = input;
            if(!Array.isArray(input)) {
                inputs = [input];
            }
            inputs.forEach(input => {
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
            });

            this._setDirtyBtns();

            if (feature === this.selectedAddressPointFeature) {
                this._checkRules(feature);
            }
        }
        // return this.isDirty(feature);
    }

    private _addMenuItemLocationSort = element => {
        this.own(on(element, "click", this._onMenuItemLocationSort));
    }

    private _onMenuItemLocationSort = event => {
        if (this.addressPointFeatures.length <= 1) return;

        this.menuFieldName = event.target.attributes["data-field"].value;
        const directionSort = (html.byId("directionSortOn_" + this.menuFieldName) as HTMLInputElement).checked;

        function sortDescending(a, b) {
            const a1 = a.geometry[this.menuFieldName];
            const b1 = b.geometry[this.menuFieldName];
            return (a1 - b1);
        }

        function sortAscending(a, b) {
            const a1 = a.geometry[this.menuFieldName];
            const b1 = b.geometry[this.menuFieldName];
            return (b1 - a1);
        }
        this.addressPointFeatures.sort(lang.hitch(this, directionSort ? sortDescending : sortAscending));

        this._populateAddressTable(0);

        html.addClass(html.byId("menuLocationContent_" + this.menuFieldName), "hide");
    }

}


export = AddressManager;