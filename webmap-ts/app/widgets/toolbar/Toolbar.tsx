/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import domClass = require("dojo/dom-class");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import on = require("dojo/on");
import { tsx } from "esri/widgets/support/widget";
import i18n = require("dojo/i18n!../nls/resources");
import Tool = require("./Tool");
import { Has } from "../../utils";

const CSS = {
    base: "toolbar",
};

@subclass("esri.widgets.Toolbar")
class Toolbar extends declared(Widget) {

    @property()
    config: ApplicationConfig;

    @property()
    portal: __esri.Portal;

    @property()
    defaultButton:HTMLElement;
    
    @property()
    deferred: any;

    @property()
    mapView: __esri.MapView |__esri.SceneView;

    @property()
    search: any;

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
    private deferredKeyboardNavigation;
    private _addTools = (element: Element): dojo.promise.Promise<any> => {
        // console.log("tools *");
        if(!this.deferred) {
            this.deferred = new Deferred();
        }
        const config: ApplicationConfig = this.config;
        const toolList = [];
        const toolNames: Array<string> = [
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
            "mapKeyboardNavigation",
            "infoPanel",
            "geoCoding",
            "measure",
            // "edit",
            "bookmarks",
            // "navigation",
            "share",
            "print"
          ];
                
        toolNames.forEach((toolName: string) => {
            if (Has(this.config, toolName)) {
                switch (toolName) {
                    case "mapKeyboardNavigation":
                        toolList.push(
                            this._addMapKeyboardNavigation(this.deferredKeyboardNavigation = new Deferred<Tool>())
                        );
                        break;
                    case "details":
                        toolList.push(this._addDetaills(element));
                        break;
                    case "instructions":
                        toolList.push(this._addInstructions(element));
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
                    case "infoPanel" :
                        toolList.push(this._addInfoPanel(element, this.mapView));
                        break;
                    case "bookmarks" :
                        toolList.push(this._addBookmarks(element, this.mapView));
                        break;
                    case "print" :
                        toolList.push(this._addPrint(element, this.mapView));
                        break;
                    case "filter" :
                        toolList.push(this._addFilters(element, this.mapView));
                        break;
                    case "measure" :
                        toolList.push(this._addMeasure(element, this.mapView));
                        break;
                    case "features" :
                        // toolList.push(this._addFeaturesList(element, this.mapView));
                        break;
                    case "overview" :
                        // toolList.push(this._addOverview(element, this.mapView));
                        break;
                    case "share" :
                        break;
                default:
                        toolList.push(this._addTool(element, toolName));
                        break;
                }
            }
        });
        toolList.push(this._addAddressManager(element, this.mapView));

        All(toolList).then(() => {
            // console.log("All", this.defaultButton, toolList);
            if(this.defaultButton) {
                this.defaultButton.click();
            }
            this.deferred.resolve(this);
        });

        return this.deferred.promise;
    }

    private toolDictionary = [];
    public getByName = (name:string) : Tool => {
        const matches = this.toolDictionary.filter(item => item.name == name);
        if(matches && matches.length == 1) {
            return matches[0].tool;
        }
        return null;
    }

    private _addTool = (element: Element, toolName: string): dojo.Deferred<Tool> => {
        const deferred = new Deferred<Tool>();

        require(["./Tool"], (Tool) => {
            const t = new Tool({
                config: this.config,
                tool: toolName,
                toolBar: this,
                container: domConstruct.create("div", {}, element)
            });
            t.pageReady.then(() => {
                this.toolDictionary.push({name:toolName, tool:t});
                deferred.resolve(t);
            });
        });
        return deferred;
    }

    private _addAddressManager  = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        const deferred = new Deferred<Tool>();
        this._addTool(element, "AddressManager").then((tool) => {
            require(["../AddressManager/AddressManager"], (AddressManager) => {
                tool.myWidget = new AddressManager({
                    mapView: this.mapView,
                    container: tool.myToolPage.pageContent
                })
            })
            deferred.resolve(tool);
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

            if (!description.isNullOrWhiteSpace()) {
                const hasInstructions = Has(this.config, "instructions");
                this._addTool(element, "details").then((tool) => {
                    tool.pageReady.then((toolPage) => {
                        toolPage.pageContent.innerHTML = `<div id="detailDiv" tabindex=0>${description}</div>`;
                        domClass.add(toolPage.pageContent, (hasInstructions ? "" : "detailHalf"));

                        this.defaultButton = tool.myInputBtn;
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
                if (!moreHelpUrl.isNullOrWhiteSpace()) {
                    instructionsText = `${instructionsText}
<br />
<a href="${moreHelpUrl}" target="blank" class="more_help">${i18n.moreHelp}</a>
`;
                }
                deferred.resolve(instructionsText)
            });
            return deferred.promise;
        })().
        then((instructionsText:string) => {
                
            if(!instructionsText.isNullOrWhiteSpace()) {
                if (!Has(this.config, "details")) {
                    this._addTool(element, "instructions").then((tool) => {
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

                        deferredInstructions.resolve(tool);
                    })
                    return deferredInstructions;
                }
                else {
                    this.deferredDetails.then((tool) => {
                        domConstruct.create(
                        "div",
                        {
                            id: "instructionsDiv",
                            innerHTML: instructionsText,
                            tabindex: 0
                        }, tool.myToolPage.pageContent);
                       
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

    private _addFilters = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "filter")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "filter").then((tool) => {
                require(["../Filters/Filters"], (Filters) => {
                    const filters = tool.myWidget = new Filters({
                        mainView:mainView,
                        tool: tool,
                        container: domConstruct.create("div", {class:"FilterTabs"}, "pageBody_filter")
                    });

                    const badge = tool.addBadge({
                        toolBadgeEvn: "someFilters",
                        toolBadgeImg: "images/someFilters.png",
                        toolBadgeTip: i18n.badgesTips.someFilters,
                    });
                    // tool.showBadge(badge);
                

                    deferred.resolve(tool);
                });
            });
            return deferred;
        }
        return null;
    }

    private _addFeaturesList = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "features")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "features").then((tool) => {
                require(["../FeaturesList/FeaturesList"], (Features) => {
                    const features = tool.myWidget = new Features({
                        mapView:this.mapView,
                        tool: tool,
                        container: domConstruct.create("div", {class:"Features"}, "pageBody_features")
                    });

                    const badge = tool.addBadge({
                        toolBadgeEvn: "featureSelected",
                        toolBadgeImg: 'images/SelectBadge.png', //this.config.marker.isNullOrWhiteSpace() ? 'images/ripple-dot1.gif' : this.config.marker,
                        toolBadgeTip: i18n.badgesTips.featureSelected,
                    });
                    // tool.showBadge(badge);

                    deferred.resolve(tool);
                });
            });
            return deferred;
        }
        return null;
    }

    private _addOverview = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "overview")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "overview").then((tool) => {
                require(["../MyOverviewMap/MyOverviewMap"], (MyOverviewMap) => {
                    const overviewMap = tool.myWidget = new MyOverviewMap({
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
                        overviewMap.scaleFactor = event.target.value;
                    });
                    on(overviewMapScale, "change", (event) => {
                        overviewMap.scaleFactor = event.target.value;
                    });
                    on(overviewMapScale, "input", (event) => {
                        overviewMap.scaleFactor = event.target.value;
                    });
                    deferred.resolve(tool);
                });
            });
            return deferred;
        }
        return null;
    }

    private _addBasemap = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "basemap")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "basemap").then((tool) => {
                require(["../BaseMaps/BaseMaps"], (BaseMaps) => {
                    tool.myWidget = new BaseMaps({
                        config: this.config,
                        portal: this.portal,
                        mapView: this.mapView,
                        container: tool.myToolPage.pageContent
                    })
                })
                deferred.resolve(tool);
            })
            return deferred;
        }
        return null;
    }

    private _addLegend = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "legend")) {
            const deferred = 
            new Deferred<Tool>();
            this._addTool(element, "legend").then((tool) => {
                require(["esri/widgets/Legend"], (Legend) => {
                    tool.myWidget = new Legend({
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    deferred.resolve(tool)
                });
            })
            return deferred;
        }
        return null;
    }

    private _addLayers = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "layers")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "layers").then((tool) => {
                require(["../TOC/TOC"], (TOC) => {
                    tool.myWidget = new TOC({
                        config: this.config,
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    deferred.resolve(tool);
                })
            })
            return deferred;
        }
        return null;
    }

    private _addInfoPanel = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "infoPanel")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "infoPanel").then((tool) => {
                require(["../InfoPanel/InfoPanel"], (InfoPanel) => {
                    tool.myWidget = new InfoPanel({
                        // config: this.config,
                        mapView:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent),
                        search: this.search,
                    })
                    deferred.resolve(tool);
                })
            })
            return deferred;
        }
        return null;
    }


    private _addBookmarks = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "bookmarks") /*&& this.config.response.itemInfo.itemData.bookmarks*/) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "bookmarks").then((tool) => {
                require(["esri/widgets/Bookmarks"], (Bookmarks) => {
                    new Bookmarks({
                        view:mainView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    })
                    deferred.resolve(tool);
                });
            })
            return deferred;
        }
        return null;
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
                    watchUtils.watch(print.exportedLinks, "length", (newValue) => {
                        tool.showLoading();
                        watchUtils.once(print.exportedLinks.items[newValue-1], "state", () => {
                            tool.hideLoading();
                        })
                    });
                    deferred.resolve(tool);
                });
            })
            return deferred;
        }
        return null;
    }

    private _addMeasure = (element: Element, mainView: __esri.MapView | __esri.SceneView) : dojo.Deferred<Tool> => {
        if(Has(this.config, "measure")) {
            const deferred = new Deferred<Tool>();
            this._addTool(element, "measure").then((tool) => {
                require(["../Measurement/Measurement"], (Measurement) => {
                    new Measurement({
                        mapView: this.mapView,
                        container: domConstruct.create("div", {}, tool.myToolPage.pageContent)
                    });
                    deferred.resolve(tool);
                })
            })
            return deferred;
        }
        return null;
    }

    private superNav;
    private _addMapKeyboardNavigation = (deferred) => {
        // var deferred = new Deferred();
        if (Has(this.config, "mapKeyboardNavigation")) {
            require(["../KeyboardMapNavigator/KeyboardMapNavigator"], (KeyboardMapNavigator) => {
                this.mapView.when(() => {
                    this.superNav = new KeyboardMapNavigator({
                        deferred: deferred,
                        mapView: this.mapView,
                        toolBar: this,
                        cursorColor: "black",
                        selectionColor: this.config.mapSelectionColor,
                        cursorFocusColor: this.config.focusColor,
                        // operationalLayers: this.config.response.itemInfo.itemData.operationalLayers,
                        container: domConstruct.create("div", {})//, this.mapView.ui.container)
                    });
                    // deferred.resolve(true);
                })
            });
        } else {
            deferred.resolve(false);
        }
        return deferred;
    }


}

export = Toolbar;
