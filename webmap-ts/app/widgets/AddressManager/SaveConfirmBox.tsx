/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");

import on = require("dojo/on");
import html = require("dojo/_base/html");

import { renderable, tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!./nls/resources");
import watchUtils = require("esri/core/watchUtils");

@subclass("esri.widgets.SaveConfirmBox")
class SaveConfirmBox extends declared(Widget) {
    static SAVE = "SAVE";
    static SAVE_SAFE = "SAVE_SAFE";
    static CANCEL = "CANCEL";


    @property()
    Response: string = null;

    private confirmBox: HTMLElement;
    private confirmBoxContent: HTMLElement;
    private cancelSaveBtn: HTMLElement;
    private saveConfirmBtn: HTMLElement;
    private saveConfirmSafeBtn: HTMLElement;

    render() {
        return ( 
            <div class="confirm" afterCreate={this._addConfirmBox} style="display: none;">
                <div class="wrapper">
                    <div class="box">
                    <div class="header"><h1>{i18n.addressManager.saveConfirmTitle}</h1></div>
                    <div class="content"afterCreate={this._addConfirmBoxContent} ></div>
                    <div class="footer">
                    <input type="button" afterCreate={this._addSaveConfirmBtn} style="justify-self: left;" class="orangeBtn" value="Save"/>
                    <input type="button" afterCreate={this._addSaveConfirmSafeBtn} style="justify-self: left;" class="greenBtn" value="Save as To Review"/>
                    <input type="button" afterCreate={this._addCancelSaveBtn} style="justify-self: right; grid-column-start: 5" class="blankBtn"value="Cancel"/>
                    </div>
                </div>
                </div>
            </div>
        )
    }

    private _addConfirmBox = (element: Element) => {
        this.confirmBox = element as HTMLElement;
    }

    private _addConfirmBoxContent = (element: Element) => {
        this.confirmBoxContent = element as HTMLElement;
    }

    private _addCancelSaveBtn = (element: Element) => {
        this.cancelSaveBtn = element as HTMLElement;
        this.own(on(this.cancelSaveBtn, "click", event => {
            this.Response = SaveConfirmBox.CANCEL;
        }))
    }

    private _addSaveConfirmBtn = (element: Element) => {
        this.saveConfirmBtn = element as HTMLElement;
        this.own(on(this.saveConfirmBtn, "click", event => {
            this.Response = SaveConfirmBox.SAVE;
        }))
    }

    private _addSaveConfirmSafeBtn = (element: Element) => {
        this.saveConfirmSafeBtn = element as HTMLElement;
        this.own(on(this.saveConfirmSafeBtn, "click", event => {
            this.Response = SaveConfirmBox.SAVE_SAFE;
        }))
    }

    public Ask = (rules: string[], title:string = null): Promise<string> => {
        return new Promise((resolve, reject) => {
            if(rules == null || rules.length == 0) {
                resolve(this.Response = SaveConfirmBox.SAVE);
            } else {
                this.confirmBoxContent.innerHTML = rules.join("<br/>");
                this.Response = null;
                html.setStyle(this.confirmBox, "display", "");
                watchUtils.once(this, "Response", () => {
                    html.setStyle(this.confirmBox, "display", "none");
                    if(this.Response != SaveConfirmBox.CANCEL) {
                        resolve(this.Response);
                    } else {
                        reject(this.Response);
                    }
                })
            }
        })
    }

}

export = SaveConfirmBox;
  