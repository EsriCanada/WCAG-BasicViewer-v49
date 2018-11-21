/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";

const CSS = {
    base: "toolbar",
    emphasis: "toolbar--emphasis"
  };

  @subclass("esri.widgets.Toolbar")
  class Toolbar extends declared(Widget) {
  
    @property()
    @renderable()
    emphasized: boolean = false;
  
    render() {
        const greeting = this._getGreeting();
        const classes = {
        [CSS.emphasis]: this.emphasized
        };
    
        return (
        <div class={this.classes(CSS.base, classes)}>
            {greeting}
        </div>
        );
    }

    private _getGreeting(): string {
        return `Toolbar`;
    }
        
}

export = Toolbar;


