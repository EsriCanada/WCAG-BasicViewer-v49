/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import registry = require("dijit/registry");
import Deferred = require("dojo/Deferred");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import Tool = require("./Tool");
import { Badge } from  "./Badge";
import ToolPage = require("./ToolPage");
import { Has } from "../../utils";

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

    private _addTools = (element: Element) : void => {
        // console.log("tools *");
        const config:ApplicationConfig = this.config;
        this.tools.forEach((tool:string) => {
            // console.log(tool);
            if(Has(this.config, tool)) {
                switch (tool) {
                    case "details" :
                        break;
                        case "instructions" :
                        this._addInstructions(element);
                        break;
                    case "directions" :
                        this._addDirections(element);
                        break;
                    default:
                        this._addTool(element, tool);
                        break;
                }
            }
            
        })
    }

    private _addTool = (element: Element, tool:string) : any => {
        // console.log(tool, this.config);
        const deferrer = new Deferred();

        require([
            "./Tool"
            ], lang.hitch(this, function(
                Tool
            ) {
                const t = new Tool({ 
                    config: this.config, 
                    tool: tool,
                    container: domConstruct.create("div", {}, element) });
                deferrer.resolve(t);
            }));
        return deferrer.promise;
    }
    
    private _addInstructions = (element: Element): void => {
        this._addTool(element, "instructions").then((instructions) => {
            instructions.pageReady.then((tool) => {
                instructions.active = true;
                // instructions.myToolPage
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


