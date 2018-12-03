/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import on = require("dojo/on");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

import { Has } from "../../utils";

  @subclass("esri.widgets.ToolPage")
    class ToolPage extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    @property()
    tool: string;

    @property()
    @renderable()
    hide: boolean = true;

    @property()
    pageContent: Element;

    constructor() {
        super();
    }    
  
    render() {
        const dynamicStyles = {
            display: this.hide ? "none" : ""
          };
        
        const pageTitle: string = i18n.tooltips[this.tool] || this.tool;
        const pageId = `page_${this.tool}`;
        const name=this.tool;
        const panelClass="";
        return (
<div class="page">
    <div 
        styles={dynamicStyles}
		class="pageContent"
        role="dialog"
        id={pageId}
        aria-labelledby={"pagetitle_"+name}>
        <div
        	id={"pageHeader_"+name}
            class="pageHeader fc bg">
            <h2
            	class="pageTitle fc"
                id={"pagetitle_"+name}>{pageTitle}</h2>
            <div
            	id={"loading_"+name}
                class="hideLoading small-loading"
                >
            </div>
        </div>

        <div 
        	class={"pageBody"+panelClass}
            tabindex="0"
            id={"pageBody_"+name}
            afterCreate={this._pageContentReady}
            >

        </div>
    </div>
</div>
        );
    }

    private _pageContentReady = (element: Element) : void => {
        this.pageContent = element;
        on(element, "keydown", lang.hitch(this, (event): void => {
            switch (event.key) {
                case "Esc":
                case "Escape":
                    const id = element.id.replace(
                        "pageBody",
                        "toolButton"
                    );
                    document.getElementById(id).focus();
                    console.log("Esc", id);
                    break;
            }
        }))
    }
}

export = ToolPage;


