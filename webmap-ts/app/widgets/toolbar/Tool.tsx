/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
// import * as Promise from 'lib';

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import Deferred = require("dojo/Deferred");


import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import ToolBar = require("./Toolbar");
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
    toolBar: ToolBar;
    
    @property()
    toolBadge : Badge = null;

    @property()
    myPanelTool: Element;
  
    @property()
    myToolPage : ToolPage;

    // @property()
    // @renderable()
    // hide: boolean;
  
    @property()
    @renderable()
    active: boolean;
  
    constructor() {
        super();
        // this.hide=false;
        this.active=false;
        // this.id=`toolButton_${this.tool}`;
    }
            
    render() {
        const active = this.active? "panelTool active" : "panelTool";
        // const dynamicStyles = {
        //     display: this.hide ? "none" : ""
        //   };
        return (
        <div 
            class={active}
            afterCreate={this._addTool} 
            bind={this} 
            >
        </div>
        );
    }

    private _addTool = (element: Element) => {
        // console.log(this.tool, this.config);
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
            click: lang.hitch(this, this._execute)
        }, element);
        if(this.toolBadge) {
            // if(typeof(toolBadge) === "Badge")
            domConstruct.create("img",{
                class: "setIndicator",
                // style: "display:none;",
                src: this.toolBadge.toolBadgeImg,
                // tabindex: "0",
                id: `badge_${this.toolBadge.toolBadgeEvn}`,
                    // toolBadgeImg: string;
                    // toolBadgeTip: string}',
                alt: this.toolBadge.toolBadgeTip,
                title: this.toolBadge.toolBadgeTip
                }, element
            )
        };
        this._addPage(this.tool).then((toolPage) => this.myToolPage = toolPage);
        // console.log("_addPage", this);
    }

    private _execute = (evn) => {
        const panelsTool = query(".panelTool", "panelTools");
        // console.log("execute", evn, panelsTool);
        panelsTool.forEach((panel) => {
            if(this.myPanelTool != panel)
                domClass.remove(panel, "active");
        })
            
        this.active = !this.active;
        if(!this.active) {
            const instructionsBtn = document.getElementById("toolButton_instructions");
            if(instructionsBtn) {
                setTimeout(() => instructionsBtn.click() ,100);
            }
        }

        // console.log("myToolPage", this);
        const pagesContent: dojo.NodeList<Element> = query(".pageContent", "panelPages");
        // console.log("pagesContent", pagesContent);
        pagesContent.forEach((page) => {
            domStyle.set(page, "display", "none");
        })
        if(this.myToolPage) {
            this.myToolPage.hide = !this.active;
        }
    }

    private _addPage = (tool: string) : any => {
        const deferrer = new Deferred();
        const config = this.config;
        let page = null;
        require([
            "./ToolPage"
        ], function(
            ToolPage
        ) {
            page = new ToolPage({ config: config, tool: tool, container: "panelPages" });
            deferrer.resolve(page);
            // console.log("_addPage", page, this);
        });
        return deferrer.promise;
    }

}

export = Tool;


