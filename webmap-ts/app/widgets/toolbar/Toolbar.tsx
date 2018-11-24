/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");

import { renderable, tsx } from "esri/widgets/support/widget";

import Tool = require("./Tool");

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
        <div class={this.classes(CSS.base, classes)} afterCreate={lang.hitch(this, lang.hitch(this, this._addTools))}>
        </div>
        );
    }

    private _addTools(element: Element) {
        console.log("tools");
        const config = this.config;
        this.tools.forEach((tool:string) => {
            // console.log(tool);
            // domConstruct.create("span", {innerHTML: tool+" "}, this.container);
            new Tool({config: config, tool: tool, container: "panelTools" })
        })
    }

}

export = Toolbar;


