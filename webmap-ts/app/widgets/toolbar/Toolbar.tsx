/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import registry = require("dijit/registry");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import ToolPage = require("./ToolPage");


const CSS = {
    base: "toolbar",
  };

  interface Badge {
    toolBadgeEvn: string;
    toolBadgeImg: string;
    toolBadgeTip: string
    }

  @subclass("esri.widgets.Toolbar")
  class Toolbar extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    @property()
    tools: Array<string>;
  
    render() {
        const classes = {
        };
        return (
        <div class={this.classes(CSS.base, classes)} afterCreate={this._addTools}>
        </div>
        );
    }

    private has = (tool:string) : boolean => {
        // console.log("has", tool, this.config[`tool_${tool}`]);
        const hasTool = this.config[`tool_${tool}`]
        return hasTool != 'undefined' && hasTool;
    }

    private _addTools = (element: Element) : void => {
        // console.log("tools *");
        const config:ApplicationConfig = this.config;
        this.tools.forEach((tool:string) => {
            // console.log(tool);
            if(this.has(tool)) {
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

    private _addTool = (element: Element, tool:string, loader: boolean=false, toolBadge? : Badge) => {
        // console.log(tool, this.config);
        const toolBtnId:string = `toolButton_${tool}`;
        const icon:string = `images/icons_${this.config.icons}/${tool}.png`;
        const tip = i18n.tooltips[tool] || tool;
        const toolFrame = domConstruct.create("div", {
            class: "panelTool",
            // autofocus:true,
            // tabindex:0,
            // title: tip,
            // "aria-label": tip,
            // "data-tip": tip
        }, element)
        domConstruct.create("input", {
            // innerHTML:tool+" ", 
            id:toolBtnId,
            type:"image",
            title:tip,
            src:icon,
            "aria-label": tip, 
        }, toolFrame);
        if(toolBadge) {
            // if(typeof(toolBadge) === "Badge")
            domConstruct.create("img",{
                class: "setIndicator",
                // style: "display:none;",
                src: toolBadge.toolBadgeImg,
                tabindex: "0",
                id: `badge_${toolBadge.toolBadgeEvn}`,
                    // toolBadgeImg: string;
                    // toolBadgeTip: string}',
                alt: toolBadge.toolBadgeTip,
                title: toolBadge.toolBadgeTip
                },toolFrame
            )
        }
    }

    private _addPage = (tool: string, loader?: boolean) : void => {
        require([
            "./ToolPage"
          ], lang.hitch(this, function(
            ToolPage
          ) {
            // console.log("_addPage");
            new ToolPage({ config: this.config, tool: tool, container: "panelPages" });
          }));
    }

    private _addInstructions = (element: Element): void => {
        this._addTool(element, "instructions");
    }

    private _addDirections = (element: Element): void => {
        this._addTool(element, "directions", true, { 
            toolBadgeEvn: "route",
            toolBadgeImg: "images/Route.png",
            toolBadgeTip: i18n.badgesTips.directions,
        });
        this._addPage("directions");
        setTimeout(
        () => console.log("directionsPage", document.getElementById("pagetitle_directions")), 1000);
    }

}

export = Toolbar;


