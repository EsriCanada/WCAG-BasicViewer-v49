/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");
import on = require("dojo/on");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import Tool = require("./Tool");
import { Badge } from "./Badge";
import ToolPage = require("./ToolPage");
import { Has, isNullOrWhiteSpace } from "../../utils";

const CSS = {
    base: "toolbar",
};

@subclass("esri.widgets.Toolbar")
class Toolbar extends declared(Widget) {

    @property()
    config: ApplicationConfig;

    @property()
    tools: Array<string>;

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
    private _addTools = (element: Element): void => {
        // console.log("tools *");
        const config: ApplicationConfig = this.config;
        this.tools.forEach((tool: string) => {
            // console.log(tool);
            if (Has(this.config, tool)) {
                switch (tool) {
                    case "details":
                        this._addDetaills(element, this.deferredDetails);
                        break;
                    case "instructions":
                        this._addInstructions(element);
                        break;
                    case "directions":
                        this._addDirections(element);
                        break;
                    default:
                        this._addTool(element, tool);
                        break;
                }
            }

        })
    }

    private _addTool = (element: Element, tool: string): any => {
        // console.log(tool);
        const deferrer = new Deferred();

        require([
            "./Tool"
        ], lang.hitch(this, function (
            Tool
        ) {
            // console.log("_addTool", this);
            const t = new Tool({
                config: this.config,
                tool: tool,
                toolBar: this,
                container: domConstruct.create("div", {}, element)
            });
            deferrer.resolve(t);
        }));
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
                        console.log("details 3", detailDiv);

                        // const detailBtn = query("#toolButton_details", tool)[0];
                        // domClass.add(detailBtn, "panelToolDefault");
                        this.deferredDetails.resolve(tool.pageContent);
                    });
                });
            }
            else {
                this.deferredDetails.reject();
            }
        }
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
                console.log("instructionsText", instructionsText);
                deffer.resolve(instructionsText)
            });
            return deffer.promise;
        })().then(lang.hitch(this, (instructionsText:string) => {
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
                    })
                })
            }
            else {
                this.deferredDetails.then(lang.hitch(this, (pageContent) => {
                    const pageBody_details = document.getElementById("pageBody_details");
                    const instructionsDiv = domConstruct.create(
                        "div",
                        {
                            id: "instructionsDiv",
                            innerHTML: instructionsText,
                            tabindex: 0
                        },
                        pageBody_details);
                }));

            }
        }))
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

}

export = Toolbar;
