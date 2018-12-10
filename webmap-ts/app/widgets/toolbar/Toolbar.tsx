/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import dom = require("dojo/dom");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import on = require("dojo/on");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import Tool = require("./Tool");
import { Badge } from "./Badge";
import ToolPage = require("./ToolPage");
import { Has, isNullOrWhiteSpace } from "../../utils";
import MyOverviewMap = require("../MyOverviewMap/MyOverviewMap");

const CSS = {
    base: "toolbar",
};

@subclass("esri.widgets.Toolbar")
class Toolbar extends declared(Widget) {

    @property()
    config: ApplicationConfig;

    @property()
    defaultButton:HTMLElement;
    
    @property()
    deferred: any;

    @property()
    mapView: __esri.MapView |__esri.SceneView;

    constructor() {
        super();
    }

    render() {
        const classes = {
        };
        return (
            <div class={this.classes(CSS.base, classes)} afterCreate={this._addTools}>
            </div>
        );
    }

    private deferredDetails = new Deferred();
    private _addTools = (element: Element): dojo.promise.Promise<any> => {
        // console.log("tools *");
        if(!this.deferred) {
            this.deferred = new Deferred();
        }
        const config: ApplicationConfig = this.config;
        const toolList = [];
        const tools: Array<string> = [
            "details", 
            "instructions",
            "overview",
            // "layerManager",
            "basemap",
            "legend",
            "layers",
            "filter",
            "features",
            "directions",
            // "mapKeyboardNavigation",
            "infoPanel",
            "geoCoding",
            "measure",
            // "edit",
            "bookmarks",
            // "navigation",
            "share",
            "print"
          ];
                
        tools.forEach((tool: string) => {
            // console.log(tool);
            if (Has(this.config, tool)) {
                switch (tool) {
                    case "details":
                        toolList.push(this._addDetaills(element, this.deferredDetails));
                        break;
                    case "instructions":
                        toolList.push(this._addInstructions(element));
                        break;
                    // case "directions":
                    //     toolList.push(this._addDirections(element));
                    //     break;
                    case "overview" :
                        toolList.push(this._addOverview(element, this.mapView));
                        break;
                    case "basemap" :
                        toolList.push(this._addBasemap(element, this.mapView));
                        break;
                    case "legend" :
                        toolList.push(this._addLegend(element, this.mapView));
                        break;
                    case "bookmarks" :
                        toolList.push(this._addBookmarks(element, this.mapView));
                        break;
                    case "print" :
                        toolList.push(this._addPrint(element, this.mapView));
                        break;
                    default:
                        toolList.push(this._addTool(element, tool));
                        break;
                }
            }
        });

        All(toolList).then(() => {
            // console.log("All", this);
            if(this.defaultButton) {
                // console.log("defaultButton", this.defaultButton);
                this.defaultButton.click();
            }
            this.deferred.resolve(this);
        });

        return this.deferred.promise;
    }

    private _addTool = (element: Element, tool: string): any => {
        // console.log(tool);
        const deferrer = new Deferred();

        require(["./Tool"], (Tool) => {
            // console.log("_addTool", this);
            const t = new Tool({
                config: this.config,
                tool: tool,
                toolBar: this,
                container: domConstruct.create("div", {}, element)
            });
            t.pageReady.then(() => deferrer.resolve(t));
        });
        return deferrer.promise;
    }

    private _addDetaills = (element: Element, deferred: any) : any => {
        if(Has(this.config, "details")) {
            const description =
            this.config.description ||
            this.config.response.itemInfo.item.description ||
            this.config.response.itemInfo.item.snippet ||
            " ";
            // console.log("_addDetaills", description);

            if (!isNullOrWhiteSpace(description)) {
                const hasInstructions = Has(this.config, "instructions");
                this._addTool(element, "details").then((details) => {
                    // console.log("details 1", details);
                    details.pageReady.then((tool) => {
                        // console.log("details 2", tool);
                        const detailDiv = tool.pageContent;
                        detailDiv.innerHTML = `<div id="detailDiv" tabindex=0>${description}</div>`;
                        domClass.add(detailDiv, (hasInstructions ? "" : "detailHalf"));
                        // console.log("details 3", detailDiv);

                        // domClass.add(details.defaultButton, "defaultButton");
                        this.defaultButton = details.myInputBtn;

                        this.deferredDetails.resolve(tool.pageContent);
                    });
                });
            }
            else {
                this.deferredDetails.reject();
            }
        }
        else {
            this.deferredDetails.reject();
        }
        return this.deferredDetails.promise;
    };

    private _addInstructions = (element: Element): void => {
        (() : dojo.promise.Promise<any> => {
            const deffer = new Deferred();
            const moreHelpUrl: string = this.config.moreHelpURL;
            require([
                `dojo/text!./Templates/${i18n.instructions}.html`
            ], function (instructionsText) {
                // console.log("instructionsText", instructionsText, moreHelpUrl, i18n.moreHelp);
                if (!isNullOrWhiteSpace(moreHelpUrl)) {
                    instructionsText = `${instructionsText}
<br />
<a href="${moreHelpUrl}" target="blank" class="more_help">${i18n.moreHelp}</a>
`;
                }
                // console.log("instructionsText", instructionsText);
                // this.defaultButton = instructionsText.myInputBtn;

                deffer.resolve(instructionsText)
            });
            return deffer.promise;
        })().then((instructionsText:string) => {
            if (!Has(this.config, "details")) {
                this._addTool(element, "instructions").then((instructions) => {
                    instructions.pageReady.then((string) => {
                        domConstruct.create(
                            "div",
                            {
                                id: "instructionsDiv",
                                innerHTML: instructionsText,
                                tabindex: 0
                            },
                            domConstruct.create("div", {}, instructions.myToolPage.pageContent)
                        );
                        instructions.active = true;

                        this.defaultButton = instructions.myInputBtn;
                    })
                })
            }
            else {
                this.deferredDetails.then((pageContent) => {
                    const pageBody_details = document.getElementById("pageBody_details");
                    const instructionsDiv = domConstruct.create(
                        "div",
                        {
                            id: "instructionsDiv",
                            innerHTML: instructionsText,
                            tabindex: 0
                        },
                        pageBody_details);
                });

            }
        })
    }

    private _addDirections = (element: Element): void => {
        this._addTool(element, "directions").then((directions) => {
            const badge = directions.addBadge({
                toolBadgeEvn: "route",
                toolBadgeImg: "images/Route.png",
                toolBadgeTip: i18n.badgesTips.directions,
            });
            directions.showBadge(badge);
            directions.hideBadge(badge);
        });
    }

    private _addOverview = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.promise.Promise<Tool> => {
        if(Has(this.config, "overview")) {
            const deferred = this._addTool(element, "overview");
            deferred.then((overviewTool) => {
                require(["../MyOverviewMap/MyOverviewMap"], (MyOverviewMap) => {
                    const overviewMap = new MyOverviewMap({
                        mainView:mainView,
                        scaleUnits: this.config.scaleUnits,
                        container: domConstruct.create("div", {}, "pageBody_overview")
                    });
                    const overviewMapScale = domConstruct.create("input", {
                            id: "overviewMapScale", 
                            type:"number", 
                            value: overviewMap.scaleFactor,
                            min:1, max:4,
                            class:"header__numberInput",
                    }, domConstruct.create("label", {innerHTML:`Aspect Ratio: `}, overviewTool.myToolPage.myControls));

                    on(overviewMapScale, "keyup", (event) =>  {
                        // console.log("keyup",  event.target.value);
                        overviewMap.scaleFactor = event.target.value;
                    });
                    on(overviewMapScale, "change", (event) => {
                        // console.log("change", event.target.value);
                        overviewMap.scaleFactor = event.target.value;
                    });
                    on(overviewMapScale, "input", (event) => {
                        // console.log("input", event.target.value);
                        overviewMap.scaleFactor = event.target.value;
                    });
                });
            });
            return deferred.promise;
        }
        else {
            const deferred = new Deferred<Tool>();
            deferred.reject();
            return deferred.promise;
        }
    }

    private _addBasemap = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.promise.Promise<Tool> => {
        if(Has(this.config, "basemap")) {
            const deferred = this._addTool(element, "basemap");
                deferred.then((overviewTool) => {
                    require(["esri/widgets/BasemapGallery"], (BasemapGallery) => {
                        overviewTool.pageReady.then((toolPage) => {
                            const basemap = new BasemapGallery({
                                view:mainView,
                                container: domConstruct.create("div", {}, toolPage.pageContent)
                            })
                        });
                    });
                return deferred.promise;
            })
        }
        else {
            const deferred = new Deferred<Tool>();
            deferred.reject();
            return deferred.promise;
        }
    }

    private _addLegend = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.promise.Promise<Tool> => {
        if(Has(this.config, "legend")) {
            const deferred = this._addTool(element, "legend");
                deferred.then((overviewTool) => {
                    require(["esri/widgets/Legend"], (Legend) => {
                        overviewTool.pageReady.then((toolPage) => {
                            const basemap = new Legend({
                                view:mainView,
                                container: domConstruct.create("div", {}, toolPage.pageContent)
                            })
                        });
                    });
                return deferred.promise;
            })
        }
        else {
            const deferred = new Deferred<Tool>();
            deferred.reject();
            return deferred.promise;
        }
    }

    private _addBookmarks = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.promise.Promise<Tool> => {
        if(Has(this.config, "bookmarks") /*&& this.config.response.itemInfo.itemData.bookmarks*/) {
            const deferred = this._addTool(element, "bookmarks");
                deferred.then((overviewTool) => {
                    require(["esri/widgets/Bookmarks"], (Bookmarks) => {
                        overviewTool.pageReady.then((toolPage) => {
                            const basemap = new Bookmarks({
                                view:mainView,
                                container: domConstruct.create("div", {}, toolPage.pageContent)
                            })
                        });
                    });
                return deferred.promise;
            })
        }
        else {
            const deferred = new Deferred<Tool>();
            deferred.reject();
            return deferred.promise;
        }
    }

    private _addPrint = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.promise.Promise<Tool> => {
        if(Has(this.config, "print")) {
            const deferred = this._addTool(element, "print");
                deferred.then((overviewTool) => {
                    require(["esri/widgets/Print"], (Print) => {
                        overviewTool.pageReady.then((toolPage) => {
                            const print = new Print({
                                view:mainView,
                                printServiceUrl: this.config.printService,
                                // "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
                                container: domConstruct.create("div", {}, toolPage.pageContent)
                            });
                            // console.log("print", print);
                            require(["esri/core/watchUtils"], (watchUtils) => {
                                // console.log("exportedLinks", print.exportedLinks);
                                watchUtils.watch(print.exportedLinks, "length", (newValue) => {
                                    // console.log("exportedLinks lenght", newValue, print.exportedLinks.items[newValue-1]);
                                    overviewTool.showLoading();
                                    watchUtils.once(print.exportedLinks.items[newValue-1], "state", () => {
                                        overviewTool.hideLoading();
                                    })
                                });
                            });
                        });
                    });
                return deferred.promise;
            })
        }
        else {
            const deferred = new Deferred<Tool>();
            deferred.reject();
            return deferred.promise;
        }
    }

}

export = Toolbar;
