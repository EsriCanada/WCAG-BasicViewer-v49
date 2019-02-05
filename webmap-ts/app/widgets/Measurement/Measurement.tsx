/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import domConstruct = require("dojo/dom-construct");
import query = require("dojo/query");
import dom = require("dojo/dom");
import on = require("dojo/on");
import domAttr = require("dojo/dom-attr");
import domStyle = require("dojo/dom-style");

import { tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import { runInThisContext } from "vm";

@subclass("esri.widgets.Measurement")
  class Measurement extends declared(Widget) {
    @property()
    mapView: __esri.MapView;

    render() {
        return (
<div>
    <div class="round-border">
        <h2>Coordinate Conversion</h2>
        <div afterCreate={this._addCoordinateConversion}></div>
    </div>
    <div class="round-border">
        <h2>Distance Measuremnt</h2>
        <div afterCreate={this._addDistanceMeasurement2D}></div>
    </div>
    <div class="round-border">
        <h2>Area Measuremnt</h2>
        <div afterCreate={this._addAreaMesurement2D}></div>
    </div>
</div>
        )
    }

    private _addCoordinateConversion = (element: Element) => {
        require(["esri/widgets/CoordinateConversion"], (CoordinateConversion) => { 
            // console.log("measure", this.mapView);
            var measurementWidget = new CoordinateConversion({
                view: this.mapView,
                // mode: "capture",
                orientation: "expand-down",
                container: element
            })
        });
    }

    private _addDistanceMeasurement2D = (element: Element) => {
        require(["esri/widgets/DistanceMeasurement2D"], (DistanceMeasurement2D) => { 
            var measurementWidget = new DistanceMeasurement2D({
                viewModel: {
                    view: this.mapView,
                    unit: "metric",
                    unitOptions: ["metric", "meters", "kilometers"],
                },
                container: element
            })

            const widgetContaner = element.querySelector(".esri-direct-line-measurement-3d__container");
            // console.log("widgetContaner", widgetContaner);
            if(widgetContaner) {
                new MutationObserver((mutations) => {
                    // console.log("mutations", mutations);
                    mutations.forEach((mutation) => {
                        try{
                            // console.log("mutation", mutation);
                            const sections = query('.esri-direct-line-measurement-3d__hint, .esri-direct-line-measurement-3d__measurement', mutation.target);
                            if(sections) {
                                sections.forEach((section: HTMLElement) => {
                                    console.log("section", section);
                                    domAttr.set(section, "aria-live", "polite");
                                    domAttr.set(section, "aria-atomic", "true");
                                })
                            }
                        } catch (ex) {
                            console.log('Directions Widget Mutation Error', ex);
                        }
                    })
                }).observe(widgetContaner, {
                    attributes: false,
                    childList: true,
                    characterData: false
                })
            }

            // section.esri-direct-line-measurement-3d__hint
            // section.esri-direct-line-measurement-3d__measurement

            // aria-live="polite" aria-atomic="true"
        });
    }

    private _addAreaMesurement2D = (element: Element) => {
        require(["esri/widgets/AreaMeasurement2D"], (AreaMeasurement2D) => { 
            // console.log("measure", this.mapView);
            var measurementWidget = new AreaMeasurement2D({
                viewModel: {
                    view: this.mapView,
                    unit: "metric",
                    unitOptions: ["metric", "square-meters", "square-kilometers", "acres", "ares", "hectares"],
                },
                container: element
            })
        });
    }

}

export = Measurement;
