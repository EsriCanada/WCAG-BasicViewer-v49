/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import registry = require("dijit/registry");
import Deferred = require("dojo/Deferred");

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

    private _addTools = (element: Element): void => {
        // console.log("tools *");
        const config: ApplicationConfig = this.config;
        this.tools.forEach((tool: string) => {
            // console.log(tool);
            if (Has(this.config, tool)) {
                switch (tool) {
                    case "details":
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
            const t = new Tool({
                config: this.config,
                tool: tool,
                container: domConstruct.create("div", {}, element)
            });
            deferrer.resolve(t);
        }));
        return deferrer.promise;
    }

    private _addInstructions = (element: Element): void => {
        this._addTool(element, "instructions").then((instructions) => {
            instructions.pageReady.then((tool) => {
                // instructions.myToolPage.pageContent.innerHTML = "Some Text";
                // console.log("instructions", instructions.myToolPage.pageContent);
                // console.log("instructions", Has(this.config, "details"), this.config);
                if (!Has(this.config, "details")) {
                    require([
                        `dojo/text!./Templates/${i18n.instructions}.html`
                    ], function (instructionsText) {
                        console.log("instructionsText", instructionsText);
                        domConstruct.create(
                            "div",
                            {
                                id: "instructionsDiv",
                                innerHTML: instructionsText,
                                tabindex: 0
                            },
                            domConstruct.create("div", {}, instructions.myToolPage.pageContent)
                        );
                    });

                }
                else {
                    const moreHelpUrl: string = this.config.moreHelpURL;
                    require([
                        `dojo/text!./Templates/${i18n.instructions}.html`
                    ], function (instructionsText) {
                        // console.log("instructionsText", instructionsText, moreHelpUrl, i18n.moreHelp);
                        if (!isNullOrWhiteSpace(moreHelpUrl)) {
                            instructionsText = `${instructionsText}
<a href="${moreHelpUrl}" target="blank" class="more_help">${i18n.moreHelp}</a>
`;
                        }
                        // console.log("instructionsText", instructionsText, moreHelpUrl, !isNullOrWhiteSpace(moreHelpUrl));

                        // this.instructionsDiv = 
                        domConstruct.create(
                            "div",
                            {
                                id: "instructionsDiv",
                                innerHTML: instructionsText,
                                tabindex: 0
                            },
                            domConstruct.create("div", {}, instructions.myToolPage.pageContent)
                        );
                    });

                    // on(
                    //     toolbar,
                    //     "updateTool_details",
                    //     this._adjustDetails
                    // );
                    // on(this.map, "resize", this._adjustDetails);
                    // document.body.onresize = this._adjustDetails;

                }
                instructions.active = true;
            })
        });
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


