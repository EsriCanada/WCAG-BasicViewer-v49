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
import on = require("dojo/on");

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
    deferrer : Deferred<Tool>;

    @property()
    toolBar: ToolBar;
    
    @property()
    myPanelTool: Element;
  
    @property()
    myInputBtn: HTMLElement;
  
    @property()
    myToolPage : ToolPage;

    @property()
    @renderable()
    active: boolean;
  
    constructor() {
        super();
        this.active=false;
    }
            
    render() {
        const active = this.active? "panelTool active" : "panelTool";
        return (
        <div 
            class={active}
            afterCreate={this._addTool} 
            // afterUpdate={this._updateTool} 
            >
        </div>
        );
    }

    // private _updateTool = (element: Element) => {
    //     this.pageReady.then((page) => {
    //         console.log("_updateTool", this.tool, this.active, element);
    //     })
    // }

    // private inputNode : Element = null;

    public pageReady : any = null;
    
    private _addTool = lang.hitch(this, (element: Element): dojo.promise.Promise<Tool> => {
        if(!this.deferrer) {
            this.deferrer = new Deferred();
        }

        // console.log(this.tool, this.config);
        this.myPanelTool = element;
        const toolBtnId:string = `toolButton_${this.tool}`;
        const icon:string = `images/icons_${this.config.icons}/${this.tool}.png`;
        const tip = i18n.tooltips[this.tool] || this.tool;
        // const ariaTip = `${tip}${this.toolBadge?(". Has badge: "+this.toolBadge.toolBadgeTip):""}`;
        this.myInputBtn = domConstruct.create("input", {
            // innerHTML:tool+" ", 
            id:toolBtnId,
            type:"image",
            title:tip,
            src:icon,
            "aria-label": tip, 
            click: lang.hitch(this, this._toggle)
        }, element);

        this.pageReady = this._addPage(this.tool);
        this.pageReady.then((toolPage: ToolPage) => {
            this.myToolPage = toolPage;
            this.deferrer.resolve(this);
        });

        // on(this.myPanelTool, "click", (event) => {
        //     (this.myPanelTool.querySelector("input") as HTMLElement).click();
        // });

        return this.deferrer.promise;
        // console.log("_addPage", this);
    });

    public addBadge = (toolBadge: Badge) : Element => {
        return domConstruct.create("img",{
            class: "setIndicator",
            style: "display:none;",
            src: toolBadge.toolBadgeImg,
            // tabindex: "0",
            id: `badge_${toolBadge.toolBadgeEvn}`,
                // toolBadgeImg: string;
                // toolBadgeTip: string}',
            alt: toolBadge.toolBadgeTip,
            title: toolBadge.toolBadgeTip
            }, this.myPanelTool
        )
    }

    public showBadge = (badgeElement: Element) : void => {

        // const ariaTip = `${tip}${this.toolBadge?(". Has badge: "+this.toolBadge.toolBadgeTip):""}`;

        domStyle.set(badgeElement, "display", "");
        // console.log("showBadge", badgeElement);
    }

    public hideBadge = (badgeElement: Element) : void => {

        // const ariaTip = `${tip}`;

        domStyle.set(badgeElement, "display", "none");
    }

    private _toggle = (evn) => {
        this.active = !this.active;
        
        const panelsTool = query(".panelTool", "panelTools");
        // console.log("execute", evn, panelsTool);
        panelsTool.forEach((panel) => {
            if(this.myPanelTool != panel)
                domClass.remove(panel, "active");
        })
        
        if(this.active) {
            this.toolBar.emit("updateTool", this.tool);
            this.toolBar.emit(`updateTool_${this.tool}`, null);
        }
        else
        {
            setTimeout(() => this.toolBar.defaultButton.click(), 100); 
        }

        // console.log("myToolPage", this);
        const pagesContent: dojo.NodeList<Element> = query(".pageContent", "panelPages");
        // console.log("pagesContent", pagesContent);
        pagesContent.forEach((page) => {
            domStyle.set(page, "display", "none");
        })
        if(this.myToolPage) {
            this.myToolPage.hide = !this.active;
            if(!this.myToolPage.hide) {
                const tabbedElements = query(`[tabindex="0"]`, this.myToolPage.pageContent);
                // console.log("Page", this.myToolPage, tabbedElements);
                if(tabbedElements.length>0) {
                    // console.log("tabbedElements[0]", tabbedElements[0], (tabbedElements[0] as HTMLElement));
                    setTimeout(() => (tabbedElements[0]as HTMLElement).focus(), 200);
                }
                else {
                    // console.log("this.myToolPage.pageContent", this.myToolPage.pageContent, (this.myToolPage.pageContent as HTMLElement));
                    setTimeout(() => (this.myToolPage.pageContent as HTMLElement).focus(), 200);
                }
            }
        }
    }

    private _addPage = (tool: string) : dojo.promise.Promise<ToolPage> => {
        const deferrer = new Deferred<ToolPage>();
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


