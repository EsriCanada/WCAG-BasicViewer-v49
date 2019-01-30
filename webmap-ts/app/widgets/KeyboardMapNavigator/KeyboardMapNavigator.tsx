/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import { ApplicationConfig } from "ApplicationBase/interfaces";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import domStyle = require("dojo/dom-style");
import domClass = require("dojo/dom-class");
import Deferred = require("dojo/Deferred");
import All = require("dojo/promise/all");
import on = require("dojo/on");
import gfx = require("dojox/gfx");
import { tsx } from "esri/widgets/support/widget";
import i18n = require("dojo/i18n!../nls/resources");
import { Point, ScreenPoint } from "esri/geometry";
import { Has } from "../../utils";

const CSS = {
    base: "toolbar",
};

@subclass("esri.widgets.KeyboardMapNavigator")
class KeyboardMapNavigator extends declared(Widget) {

    @property()
    cursorFocusColor:"red";
    
    @property()
    cursorColor:"black";
    
    @property()
    deferred: any;

    @property()
    mapView: __esri.MapView |__esri.SceneView;

    constructor() {
        super();
    }

    render() {
        return (
            <div
                id="mapSuperCursor"
                style="position:absolute; pointer-events:none;" 
                afterCreate={this._addCursor}>
            </div>
        );
    }

    private Show = () => {
        domStyle.set(this.mapSuperCursor, "display", "block");
    }

    private Hide = () => {
        domStyle.set(this.mapSuperCursor, "display", "none");
    }

    private mapSuperCursor;
    private cursorNav;
    private _addCursor = (element: Element) => {
        this.mapSuperCursor = element;
        this.mapView.ui.add(this.mapSuperCursor);
        // console.log("mapSuperCursor", this.mapSuperCursor);

        this.cursorNav = gfx.createSurface(this.mapSuperCursor, 40, 40);
        const cursor = this.cursorNav.createGroup();
        const circle = cursor.createCircle({cx:20, cy:20, r:7}).setFill("transparent").setStroke(this.cursorFocusColor);
        const path = cursor.createPath("M20 0 L20 19 M20 21 L20 40 M0 20 L19 20 M21 20 L40 20").setStroke({color:this.cursorColor, width:1});

        domStyle.set(this.mapSuperCursor, 'left', "100px");
        domStyle.set(this.mapSuperCursor, 'top', "100px");
        this.cursorToCenter();
        this.Hide();

        this.own(on(this.mapView, 'focus', this.Show));
        this.own(on(this.mapView, 'blur', this.Hide));

        this.own(on(this.mapView, 'click', (evn) => {
            // this.followTheMapMode(false);
            this.setCursorPos(this.mapView.toScreen(evn.mapPoint));
            // this.clearZone();
        }));



        this.deferred.resolve(true);
    }

    private cursorPos: ScreenPoint;
    cursorToCenter = () : ScreenPoint => {
        console.log("cursorToCenter container", this.mapView);
        const m = this.mapView.ui.container.getBoundingClientRect();
        console.log("cursorToCenter getBoundingClientRect", m);
        this.cursorPos = new ScreenPoint({x:(m.right-m.left)/2, y:(m.bottom-m.top)/2});

        domStyle.set(this.mapSuperCursor, 'left', (this.cursorPos.x-20)+'px');
        domStyle.set(this.mapSuperCursor, 'top', (this.cursorPos.y-20)+'px');

        return this.cursorPos;
    }

    private setCursorPos = (screenPoint : ScreenPoint) : ScreenPoint => {
        if(screenPoint) {
            this.cursorPos = screenPoint;
        }
        domStyle.set('mapSuperCursor', 'left', (this.cursorPos.x-20)+'px');
        domStyle.set('mapSuperCursor', 'top', (this.cursorPos.y-20)+'px');
        return this.cursorPos;
    }


}

export = KeyboardMapNavigator;
