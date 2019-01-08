/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";
import dom = require("dojo/dom");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");
import { ApplicationConfig } from "ApplicationBase/interfaces";
import registry = require("dijit/registry");
import on = require("dojo/on");
import lang = require("dojo/_base/lang");

import i18n = require("dojo/i18n!../nls/resources");

import Button = require("dijit/form/Button");

const CSS = {
    base: "contactUs",
};

@subclass("esri.widgets.ContactUs")
class ContactUs extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    render() {
        return (
            <div class="headerButton fc">
                <div afterCreate={lang.hitch(this, this._addLinkButton)}></div>
            </div>
        );
    }

    postInitialize() {
        if (this.config.contactUsURL.isNullOrWhiteSpace()) {
        // if (!this.contactUsURL.isNullOrEmpty()) {
            domStyle.set(dom.byId('contactUsNode'), 'display', 'none');
        }
    }

    private _addLinkButton(element: Element) {
        const button = new Button({
            label: i18n.contactUs,
            onClick: lang.hitch(this.config, function(){
                window.open(`${this.contactUsURL}`, "_blank").focus();
            })          
        }, element);
        button.startup();

        // console.log("button", button);

        const focusNode: HTMLElement = button.domNode.querySelector(".dijitReset.dijitStretch.dijitButtonContents");
        if(focusNode) {
            domAttr.remove(focusNode,"aria-labelledby");
        }
    }
}

export = ContactUs;


