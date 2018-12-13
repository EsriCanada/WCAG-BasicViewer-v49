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
import { doesNotReject } from "assert";

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

    private deferredDetails = new Deferred<Tool>();
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
            if (Has(this.config, tool)) {
                switch (tool) {
                    case "details":
                        toolList.push(this._addDetaills(element));
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
                    case "layers" :
                        toolList.push(this._addLayers(element, this.mapView));
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
            console.log("All", this.defaultButton, toolList);
            if(this.defaultButton) {
                // console.log("defaultButton", this.defaultButton);
                this.defaultButton.click();
            }
            this.deferred.resolve(this);
        });

        return this.deferred.promise;
    }

    private _addTool = (element: Element, tool: string): dojo.Deferred<Tool> => {
        // // // console.log("Tool ready", tooll);
        const deferred = new Deferred<Tool>();

        require(["./Tool"], (Tool) => {
            // console.log("_addTool", this);
            const t = new Tool({
                config: this.config,
                tool: tool,
                toolBar: this,
                container: domConstruct.create("div", {}, element)
            });
            t.pageReady.then(() => {
                // // console.log("Tool ready", tooll);
                deferred.resolve(t);
            });
        });
        return deferred;
    }

    private _addDetaills = (element: Element) : dojo.Deferred<Tool> => {
        if(Has(this.config, "details")) {
            const description =
            this.config.description ||
            this.config.response.itemInfo.item.description ||
            this.config.response.itemInfo.item.snippet ||
            " ";
            // console.log("_addDetaills", description);

            if (!isNullOrWhiteSpace(description)) {
                const hasInstructions = Has(this.config, "instructions");
                this._addTool(element, "details").then((tool) => {
                    tool.pageReady.then((toolPage) => {
                        toolPage.pageContent.innerHTML = `<div id="detailDiv" tabindex=0>${description}</div>`;
                        domClass.add(toolPage.pageContent, (hasInstructions ? "" : "detailHalf"));

                        this.defaultButton = tool.myInputBtn;

                        // console.log("Tool ready", tooll.tool);
                        this.deferredDetails.resolve(tool);
                    });
                });
                return this.deferredDetails;
            }
        }
        return null;
    };

    private _addInstructions = (element: Element) : dojo.Deferred<Tool> => {
        const deferredInstructions = new Deferred<Tool>();
        (() : dojo.promise.Promise<string> => {
            const deferred = new Deferred<string>();
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

                deferred.resolve(instructionsText)
            });
            return deferred.promise;
        })().
        then((instructionsText:string) => {
                
            if(!isNullOrWhiteSpace(instructionsText)) {
                if (!Has(this.config, "details")) {
                    this._addTool(element, "instructions").then((tool) => {
                        // console.log("instructions only");
                        domConstruct.create(
                            "div",
                            {
                                id: "instructionsDiv",
                                innerHTML: instructionsText,
                                tabindex: 0
                            },
                            domConstruct.create("div", {}, tool.myToolPage.pageContent)
                        );
                        this.defaultButton = tool.myInputBtn;
                        // tool.active = true;

                        console.log("Tool ready", tool.tool);
                        deferredInstructions.resolve(tool);

                    })
                    return deferredInstructions;
                }
                else {
                    this.deferredDetails.then((tool) => {
                        // const pageBody_details = document.getElementById("pageBody_details");
                        const instructionsDiv = domConstruct.create(
                        "div",
                        {
                            id: "instructionsDiv",
                            innerHTML: instructionsText,
                            tabindex: 0
                        }, tool.myToolPage.pageContent);
                        // ,
                        // pageBody_details);
                        
                        console.log("Tool ready", tool.tool);
                        deferredInstructions.resolve(tool);

                    });
                    return deferredInstructions;
                }
            }
            deferredInstructions.reject("No instructions text");
        });
        return null;
    }

    // private _addDirections = (element: Element) : dojo.Deferred<Tool> => {
    //     this._addTool(element, "directions").then((directions) => {
    //         const badge = directions.addBadge({
    //             toolBadgeEvn: "route",
    //             toolBadgeImg: "images/Route.png",
    //             toolBadgeTip: i18n.badgesTips.directions,
    //         });
    //         directions.showBadge(badge);
    //         directions.hideBadge(badge);
    //     });
    // }

    private _addOverview = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "overview")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "overview").then((tool) => {
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
                    }, domConstruct.create("label", {innerHTML:`Aspect Ratio: `}, tool.myToolPage.myControls));

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
                    // console.log("Tool ready", tooll.tool);
                    deferred.resolve(tool);
                });
            });
            return deferred;
        }
        else {
            return null;
        }
    }

    private _addBasemap = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "basemap")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "basemap").then((tool) => {
                require(["esri/widgets/BasemapGallery"], (BasemapGallery) => {
                    const basemap = new BasemapGallery({
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    // console.log("Tool ready", tooll.tool);
                    deferred.resolve(tool);
                });
            })
            return deferred;
        }
        else {
            return null;
       }
    }

    private _addLegend = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "legend")) {
            const deferred = 
            new Deferred<Tool>();
            this._addTool(element, "legend").then((tool) => {
                require(["esri/widgets/Legend"], (Legend) => {
                    const basemap = new Legend({
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    // console.log("Tool ready", tooll.tool);
                    deferred.resolve(tool)
                });
            })
            return deferred;
        }
        else {
            return null;
        }
    }

    private _addLayers = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "layers")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "layers").then((tool) => {
                require(["../TOC/TOC"], (TOC) => {
                    const toc = new TOC({
                        config: this.config,
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    // console.log("Tool ready", tooll.tool);
                    deferred.resolve(tool);
                })
            })
            return deferred;
        }
        else {
            return null;
        }
    }

    private _addBookmarks = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "bookmarks") /*&& this.config.response.itemInfo.itemData.bookmarks*/) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "bookmarks").then((tool) => {
                require(["esri/widgets/Bookmarks"], (Bookmarks) => {
                    const basemap = new Bookmarks({
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    // console.log("Tool ready", tooll.tool);
                    deferred.resolve(tool);
                });
            })
            return deferred;
        }
        else {
            return null;
        }
    }

    private _addPrint = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "print")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "print").then((tool) => {
                require(["esri/widgets/Print", "esri/core/watchUtils"], (Print, watchUtils) => {
                    const print = new Print({
                        view:mainView,
                        printServiceUrl: this.config.printService,
                        // "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task",
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    });
                    // console.log("print", print);
                    // console.log("exportedLinks", print.exportedLinks);
                    watchUtils.watch(print.exportedLinks, "length", (newValue) => {
                        // console.log("exportedLinks lenght", newValue, print.exportedLinks.items[newValue-1]);
                        tool.showLoading();
                        watchUtils.once(print.exportedLinks.items[newValue-1], "state", () => {
                            tool.hideLoading();
                        })
                    });
                    // console.log("Tool ready", tooll.tool);
                    deferred.resolve(tool);
                });
            })
            return deferred;
        }
        else {
            return null;
        }
    }

}

export = Toolbar;
