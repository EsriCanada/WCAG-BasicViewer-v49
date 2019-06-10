/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");

@subclass("esri.widgets.AddressCompiler")
  class AddressCompiler extends declared(Widget) {
  
    @property()
    address: string = null;

    @property()
    addressLayer;
  
    @property()
    inputControls = null;

    private fields: any[] = [];
    private expressions: any[] = [];
    // private _pattern: string;
  
    @property()
    get pattern(): string { return this._get("pattern"); };
    set pattern(value: string) {
        this._setPattern(value);
    }

    _setPattern(str) {
        this._set("pattern", str);

        const regex = /\(([^\)]+)\)?/gm;
        // const regex = /\(({((\w+)(?:!=(\w+))?)})+\)/gm;
        // const regex = /\((((\s?\W?\s?)?)({((\w+)(!=(\w+))?)})+(\s?\W?\s?)?)\)/gm;
  
        // let array = [...str.matchAll(/(?:\()([^{]*)(?={)({(([^}!]+(?!}))(?:(!=)([^}]+))?)})*([^\)]*)(?:\))/gm)];
        // console.log("matchAll", array);
  
        const regex1 = /{((\w+)(!=(\w+))?)+}*/g;
  
        let m;
        this.fields = [];
        while ((m = regex.exec(str as any)) !== null) {
            // This is necessary to avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) {
                regex.lastIndex++;
            }
  
            // The result can be accessed through the `m`-variable.
            m.forEach((match, groupIndex) => {
                // console.log(`Found match, group ${groupIndex}: ${match}`);
                if (groupIndex == 1) {
                    const item = { exp: match };
                    item["fields"] = {};
                    this.expressions.push(item);
  
                    let m1;
                    while ((m1 = regex1.exec(match)) !== null) {
                        // This is necessary to avoid infinite loops with zero-width matches
                        if (m1.index === regex1.lastIndex) {
                            regex1.lastIndex++;
                        }
  
                        // The result can be accessed through the `m`-variable.
                        let mm;
                        m1.forEach((match1, groupIndex1) => {
                            // console.log(`  Found match1, group ${groupIndex1}: ${match1}`);
                            if (groupIndex1 == 2) {
                                mm = match1;
                                item["fields"][mm] = {};
                                item["fields"][mm]["value"] = null;
  
                                this.fields.push(mm);
                            }
                            if (groupIndex1 == 4 && match1) {
                                item["fields"][mm]["not"] = match1;
                            }
                        });
                    }
                }
            });
            // console.log("expressions", this.expressions, this.fields);
          }
    }
  
    render() {
        return ( 
            <span/>   
        )
    }

    evaluate = feature => {
        let address = "";
        this.expressions.forEach(e => {
            // let hasValue = false;
            let displayValue = null;
            for (let fieldName in e.fields) {
                if (fieldName in feature.attributes) {
                    const fieldValue = feature.attributes[fieldName];
                    const field = this.addressLayer.fields.find(field => field.name == fieldName);
                    e.fields[fieldName].value = null;
                    if ("domain" in field && field.domain) {
                        if (field.domain.type == "coded-value") {
                            for (let i = 0; i < field.domain.codedValues.length; i++) {
                                const codeValue = field.domain.codedValues[i];
                                if (codeValue.code == fieldValue) {
                                    e.fields[fieldName].value = codeValue.name;
                                    break;
                                }
                            }
                        }
                    } else {
                        e.fields[fieldName].value = fieldValue;
                    }
                    // hasValue = hasValue || e.fields[fieldName].value;
                    if (!displayValue && (!("not" in e.fields[fieldName]) || e.fields[fieldName].value != e.fields[fieldName].not)) {
                        displayValue = e.fields[fieldName].value;
                    }
                }
            };

            if (displayValue) {
                const exp = e.exp.replace(/{.*}/gm, displayValue)
                address += exp;
            }
        })
        // console.log("evaluate expressions", this.expressions);
        // console.log("address", address);
        this.set("address", address);
        (this.container as HTMLElement).innerHTML = address;
    }

}
export = AddressCompiler;