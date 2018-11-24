/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");

import { renderable, tsx } from "esri/widgets/support/widget";

const CSS = {
    base: "tool",
  };

  @subclass("esri.widgets.Tool")
  class Tool extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    @property()
    tool: string;
    
    render() {
        const classes = {
        };
        return (
        <div class={this.classes(CSS.base, classes)} afterCreate={lang.hitch(this, lang.hitch(this, this._addTool))}>
        </div>
        );
    }

    private _addTool(element: Element) {
        console.log("tool");
        domConstruct.create("span", {innerHTML: this.tool+" "}, this.container);
    }

}

export = Tool;
