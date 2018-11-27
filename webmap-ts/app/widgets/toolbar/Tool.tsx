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
import { Badge } from "./Badge";


const CSS = {
    base: "panelTool",
  };

  @subclass("esri.widgets.Tool")
  class Tool extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    @property()
    tool: string;

    @property()
    loader: boolean=false;
    
    @property()
    toolBadge : Badge = null;

    @property()
    id: string;
  
    @property()
    @renderable()
    hide: boolean;
  
    constructor() {
        super();
        this.hide=false;
        this.id=`toolButton_${this.tool}`;
    }
            
    render() {
        // const classes = {
        //     [CSS.hideAttr]: hide;
        // };
        const dynamicStyles = {
            display: this.hide ? "none" : ""
          };
        return (
        <div 
            class={this.classes(CSS.base)} 
            styles={dynamicStyles} 
            afterCreate={this._addTool} 
            bind={this} 
            >
        </div>
        );
    }

    private _addTool = (element: Element) => {
        console.log(this.tool, this.config);
        const toolBtnId:string = `toolButton_${this.tool}`;
        const icon:string = `images/icons_${this.config.icons}/${this.tool}.png`;
        const tip = i18n.tooltips[this.tool] || this.tool;
        domConstruct.create("input", {
            // innerHTML:tool+" ", 
            id:toolBtnId,
            type:"image",
            title:tip,
            src:icon,
            "aria-label": tip, 
        }, element);
        if(this.toolBadge) {
            // if(typeof(toolBadge) === "Badge")
            domConstruct.create("img",{
                class: "setIndicator",
                // style: "display:none;",
                src: this.toolBadge.toolBadgeImg,
                tabindex: "0",
                id: `badge_${this.toolBadge.toolBadgeEvn}`,
                    // toolBadgeImg: string;
                    // toolBadgeTip: string}',
                alt: this.toolBadge.toolBadgeTip,
                title: this.toolBadge.toolBadgeTip
                }, element
            )
        }
    }

    // private _addPage = (tool: string, loader?: boolean) : void => {
    //     require([
    //         "./ToolPage"
    //       ], lang.hitch(this, function(
    //         ToolPage
    //       ) {
    //         // console.log("_addPage");
    //         new ToolPage({ config: this.config, tool: tool, container: "panelPages" });
    //       }));
    // }

    // private _addInstructions = (element: Element): void => {
    //     this._addTool(element, "instructions");
    // }

    // private _addDirections = (element: Element): void => {
    //     this._addTool(element, "directions", true, { 
    //         toolBadgeEvn: "route",
    //         toolBadgeImg: "images/Route.png",
    //         toolBadgeTip: i18n.badgesTips.directions,
    //     });
    //     this._addPage("directions");
    //     setTimeout(
    //     () => console.log("directionsPage", document.getElementById("pagetitle_directions")), 1000);
    // }

}

export = Tool;


