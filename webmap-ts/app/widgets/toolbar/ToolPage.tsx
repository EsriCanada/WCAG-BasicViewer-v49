/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import on = require("dojo/on");
import { renderable, tsx } from "esri/widgets/support/widget";
import i18n = require("dojo/i18n!../nls/resources");

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

    @property()
    myControls: HTMLElement;

    constructor() {
        super();
    }    
  
    render() {
        const dynamicStyles = {
            display: this.hide ? "none" : ""
          };
        
        const pageTitle: string = i18n.tooltips[this.tool] || this.tool;
        // console.log("tool", pageTitle, i18n);

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
                class="headerPanel"
                style="display:none;"
                >
                <img src="/images/reload1.gif" alt="Reloading" title="Reloading"/>
            </div>
            <div 
                id={"controls_"+name}
                class="headerPanel headerControls"
                afterCreate={this._controlsReady}
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

    private _controlsReady = (element: HTMLElement) : void => {
        this.myControls = element;    
    }

    private _pageContentReady = (element: Element) : void => {
        this.pageContent = element;
        on(element, "keydown", (event): void => {
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
        })
    }

    
}

export = ToolPage;


