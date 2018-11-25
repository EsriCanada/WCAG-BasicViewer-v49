/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");

import { renderable, tsx } from "esri/widgets/support/widget";

const CSS = {
    base: "toolbar",
  };

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
        <div class={this.classes(CSS.base, classes)} afterCreate={lang.hitch(this, this._addTools)}>
        </div>
        );
    }

    private _addTools(element: Element) {
        const link = document.createElement("link");
        link.href = './app/widgets/toolbar/toolbar.css';
        link.type = "text/css";
        link.rel = "stylesheet";
        link.id="ToolbarStyles";
        document.head.appendChild(link);
        
        console.log("tools *");
        const config:ApplicationConfig = this.config;
        this.tools.forEach((tool:String) => {
            // console.log(tool);
            this._addTool(element, tool);
            
        })
    }

    private _addTool(element: Element, tool:String) {
        // console.log(tool, this.config);
        const toolBtnId:string = `toolButton_${tool}`;
        const icon:string = `images/icons_${this.config.icons}/${tool}.png`;
        const tip=tool;
        const toolFrame = domConstruct.create("div", {
            class: "panelTool",
            autofocus:true,
            tabindex:0,
            // title:tip
            // aria-label="${tip}"
            // data-tip="${tip}"
        }, element)
        domConstruct.create("input", {
            // innerHTML:tool+" ", 
            id:toolBtnId,
            type:"image",
            title:tip,
            src:icon    
        }, toolFrame);
    }

}

export = Toolbar;


