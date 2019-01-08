/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";

import Widget = require("esri/widgets/Widget");

import { renderable, tsx } from "esri/widgets/support/widget";
import dom = require("dojo/dom");
import domAttr = require("dojo/dom-attr");
import domClass = require("dojo/dom-class");
import domStyle = require("dojo/dom-style");
import { ApplicationConfig } from "ApplicationBase/interfaces";
// import on = require("dojo/on");
import query = require("dojo/query");
import lang = require("dojo/_base/lang");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");

import DropDownMenu = require("dijit/DropDownMenu");
import DropDownButton = require("dijit/form/DropDownButton");
import MenuItem = require("dijit/MenuItem");

import esriLang = require("esri/core/lang");


const CSS = {
    base: "languages",
  };

  @subclass("esri.widgets.Languages")
  class Languages extends declared(Widget) {
  
    @property()
    config: ApplicationConfig;
  
    render() {
        return (
            <div class="headerButton fc">
                <div afterCreate={lang.hitch(this, lang.hitch(this, this._addLanguageMenu))}></div>
            </div>
        );
    }

    private _addLanguageMenu(element: Element) {

        const menu = new DropDownMenu({
            style: "display: none;",
        });
        let locale : String = this.config.locale;
        // console.log("locale", locale);
        if(locale.isNullOrWhiteSpace()) {
            locale = document.documentElement.lang;
        }
        let currentLocale = locale.substring(0,2).toUpperCase();
        let currentIcon = null;
        let currentLanguage = null;

        const languages = [
            {
                code: this.config.lang1code,
                img: this.config.lang1imageSrc,
                shortName: this.config.lang1shortName,
                name: this.config.lang1name,
                appId: this.config.lang1appId
            },
            {
                code: this.config.lang2code,
                img: this.config.lang2imageSrc,
                shortName: this.config.lang2shortName,
                name: this.config.lang2name,
                appId: this.config.lang2appId
            },
            {
                code: this.config.lang3code,
                img: this.config.lang3imageSrc,
                shortName: this.config.lang3shortName,
                name: this.config.lang3name,
                appId: this.config.lang3appId
            }
        ];

        for(let i = 0; i<languages.length; i++)
        {
            const Lang = languages[i];
            if(Lang.code.isNullOrWhiteSpace()) continue;

            // console.log("locale", locale, Lang.code);
            const menuItem = new MenuItem({
                label: ((this.config.locale || "") === Lang.code) ? Lang.name : `<blockquote lang="${Lang.code}">${Lang.name}</blockquote>`,
                "data-code": Lang.code,
                "data-appid": Lang.appId,
            });
            menuItem.on('click', this.Click);

            if(Lang.img && Lang.img !== '') {
                const iconCell = query(".dijitMenuItemIconCell", menuItem.domNode);
                if(iconCell) {
                    domConstruct.create("img",{
                        src: Lang.img,
                        alt: i18n.language.flag.replace("_",Lang.name).stripTags(),
                        class: 'langMenuItemIcon',
                    }, iconCell[0]);
                }
            }

            const langHint = (i18n.language.aria.changeLanguage+Lang.name as String).stripTags();
            domAttr.set(menuItem.domNode,'aria-label', langHint); 
            domAttr.set(menuItem.domNode,'title', langHint);  
            domAttr.set(menuItem.domNode,'data-code', Lang.code);
            domAttr.set(menuItem.domNode,'data-appid', Lang.appId);
            menu.addChild(menuItem);

            if(Lang.code.substring(0,2).toLowerCase() === locale.substring(0,2).toLowerCase()) {
                document.documentElement.lang = Lang.code.toLowerCase();
                if(Lang.img && Lang.img !== '') {
                    currentIcon = domConstruct.create("img",{
                        src:Lang.img,
                        alt: (i18n.language.flag as string).stripTags().replace("_", Lang.name), 
                        class: 'langIcon',
                    });
                    if(Lang.shortName && Lang.shortName !== "") {
                        currentLocale = "";
                    }
                    currentLanguage = Lang.name;
                }
            }
        }

        menu.startup();

        let currentHint = i18n.language.aria.currentLanguage+" "+(currentLanguage ? currentLanguage : document.documentElement.lang);
        let btnLbl = this.config.languageLabel ? i18n.language.language : "";

        if(!currentIcon) {
            let shortName = document.documentElement.lang.substring(0,2).toUpperCase();
            let selectLang = languages.filter(function(l) {return l.shortName == shortName;});
            let langName = 'English';
            if(selectLang && selectLang.length>0) {
                langName = selectLang[0].name;
                langName = langName.replace(/<.*?>/g, '');
            }
            btnLbl += ' <span aria-label="'+langName+'" style="font-weight:bold;">'+shortName+'</span>';
        }
        if(this.config.textColor) {
            btnLbl = '<span style="color:'+this.config.textColor+';">'+btnLbl+'</span>';
        }

        const button = new DropDownButton({
            label: btnLbl,
            title: currentHint,
            dropDown: menu,
            id: 'languageButton',
            role: 'application',
        }, element);
        button.startup();

        const arrowButton = button.domNode.querySelector('span.dijitReset.dijitInline.dijitArrowButtonChar');
        if(arrowButton) {
            domStyle.set(arrowButton, "display", "none");
        }
        if(currentIcon) {
            const iconNode = button.domNode.querySelector("[data-dojo-attach-point=iconNode]");
            if(iconNode) {
                domClass.remove(iconNode, "dijitNoIcon");
                domAttr.set(iconNode,'aria-label', currentHint);
                domAttr.set(iconNode,'title', currentHint.stripTags()); 
            }
            const _buttonNode = button.domNode.querySelector("[data-dojo-attach-point=_buttonNode]");
            if(_buttonNode) {
                domConstruct.place(currentIcon, _buttonNode.querySelector(".dijitReset .dijitArrowButtonChar"), "after");
            }
        }

        query('.dijitMenuTable').forEach(function(table: HTMLElement){
            domAttr.set(table, "role", "presentation");
        });

        query('.dijitPopup').forEach(function(table: HTMLElement){
            domAttr.set(table, "role", "menu");
        });
    }

    private Click(e) {
        console.log(e.target, e.target.parentElement);
        const menuItemDataSet = e.target.closest('.dijitMenuItem').dataset;
        const docLocale = query('html')[0]["lang"];
        // console.log("docLocale", docLocale);
        let locale = menuItemDataSet.code;
        if(!locale || locale==='' || locale === "undefined" || locale === undefined)
        {
            locale = navigator.language;
        }
        locale = locale.toLowerCase();

        if(docLocale.toLowerCase() === locale) return;

        const urlParams = new URLSearchParams(window.location.search);

        let appId = menuItemDataSet.appid;
        if(!appId || appId==='' || appId === "undefined" || appId === undefined) {
            appId = urlParams.get('appid');
            // appId = /(?:[?|&]appid=)([a-z0-9]*)/gi.exec(window.location.search);
            // if(appId && appId.length===2) {
            //     appId = appId[1];
            // }
        }

        let opt = '';
        if(urlParams.has('cache')) {
            opt += '&cache';

            const cacheVal = urlParams.get('cache');
            if(cacheVal) {
                opt+= '='+cacheVal;
            }
        }

        window.location.search=('?appid='+appId+'&locale='+locale + opt);
    }

}

export = Languages;


