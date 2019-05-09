/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "dojo/dom-style", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, domStyle, widget_1) {
    "use strict";
    var ClonePanel = /** @class */ (function (_super) {
        __extends(ClonePanel, _super);
        function ClonePanel() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.clonePanelDiv = null;
            _this._addClonePanel = function (element) {
                _this.clonePanelDiv = element;
            };
            return _this;
        }
        ClonePanel.prototype.render = function () {
            return (widget_1.tsx("div", { class: "ClonePanel", style: "display:none;", afterCreate: this._addClonePanel },
                widget_1.tsx("div", { class: "toolbar" },
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/pickRoad2.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onPickRoadClicked", title: "Pick Road", "aria-label": "Pick Road" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/Cut.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onCutClicked", title: "Cut Line", "aria-label": "Cut Line" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/Flip1.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onFlipSideClicked", title: "Flip Side", "aria-label": "Flip Side" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/Flip2.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onReverseClicked", title: "Reverse Direction", "aria-label": "Reverse Direction" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/restart.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onRestartCutsClicked", title: "Restart Cuts", "aria-label": "Restart Cuts" })),
                widget_1.tsx("div", { class: "clone_panel-content" },
                    widget_1.tsx("table", { style: "border-collapse: collapse;" },
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", { colspan: "2", style: "text-align: left;" },
                                widget_1.tsx("span", { "data-dojo-attach-point": "streetName" }))),
                        widget_1.tsx("tr", { "data-dojo-attach-point": "streetNameErrorRow", class: "hide" },
                            widget_1.tsx("th", { colspan: "2" },
                                widget_1.tsx("span", { "data-dojo-attach-point": "streetNameError", style: "color:red;" }))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", { colspan: "2", style: "text-align: left;" },
                                widget_1.tsx("label", null,
                                    widget_1.tsx("input", { type: "checkbox", "data-dojo-attach-point": "useCurrentSeed", "data-dojo-attach-event": "change:_onUseCurrentSeedGhange" }),
                                    widget_1.tsx("span", null, " Use current address as seed.")))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "distRoad" }, "Dist from Road:")),
                            widget_1.tsx("td", null,
                                widget_1.tsx("input", { type: "range", style: "width:100px; height:16px; vertical-align: bottom;", min: "10", max: "50", step: "5", name: "distRoad", value: "20" }),
                                widget_1.tsx("span", { style: "margin-left: 4px;", "data-dojo-attach-point": "distRoad" }, "20"))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "polylineLength" }, "Length (meters):")),
                            widget_1.tsx("td", null,
                                widget_1.tsx("span", { id: "polylineLength", "data-dojo-attach-point": "polylineLength" }))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", { style: "border-top: 1px solid gray; border-left: 1px solid gray;" },
                                widget_1.tsx("label", { for: "unitCount" }, "Unit Count:")),
                            widget_1.tsx("td", { style: "border-top: 1px solid gray; border-right: 1px solid gray;" },
                                widget_1.tsx("input", { type: "number", id: "unitCount", style: "width:100px; height:16px;", min: "3", max: "500", step: "1", name: "unitCountDist", value: "10", "data-dojo-attach-point": "unitCount", "data-dojo-attach-event": "change:_onUnitCountChange,input:_onUnitCountInput" }),
                                widget_1.tsx("input", { type: "radio", checked: true, name: "units", value: "unitCount", "data-dojo-attach-point": "unitCountRadio" }))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", { style: "border-bottom: 1px solid gray; border-left: 1px solid gray;" },
                                widget_1.tsx("label", { for: "unitDist" }, "Unit Distance:")),
                            widget_1.tsx("td", { style: "border-bottom: 1px solid gray; border-right: 1px solid gray;" },
                                widget_1.tsx("input", { type: "number", id: "unitDist", style: "width:100px; height:16px;", min: "20", max: "100", step: "1", name: "unitCountDist", value: "25", "data-dojo-attach-point": "unitDist", "data-dojo-attach-event": "change:_onUnitDistChange,input:_onUnitDistInput" }),
                                widget_1.tsx("input", { type: "radio", name: "units", value: "unitDist", "data-dojo-attach-point": "unitDistRadio" }))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "StreeNumStart" }, "Street # Start:")),
                            widget_1.tsx("td", null,
                                widget_1.tsx("input", { type: "number", id: "StreeNumStart", style: "width:100px; height:16px;", min: "1", step: "1", name: "StreeNumStart", value: "1", "data-dojo-attach-point": "StreeNumStart", "data-dojo-attach-event": "change:_onUnitCountChange,input:_onUnitCountInput" }))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "StreeNumStep" }, "Street # Step:")),
                            widget_1.tsx("td", null,
                                widget_1.tsx("input", { type: "number", id: "StreeNumStep", style: "width:100px; height:16px;", min: "1", max: "8", step: "1", name: "StreeNumStep", value: "2", "data-dojo-attach-point": "StreeNumStep", "data-dojo-attach-event": "change:_onUnitCountChange,input:_onUnitCountInput" }))))),
                widget_1.tsx("div", { class: "clone_panel-footer" })));
        };
        ClonePanel.prototype.show = function (showing) {
            console.log("showing", showing);
            domStyle.set(this.clonePanelDiv, "display", showing ? "" : "none");
        };
        ClonePanel = __decorate([
            decorators_1.subclass("esri.widgets.ClonePanel")
        ], ClonePanel);
        return ClonePanel;
    }(decorators_1.declared(Widget)));
    return ClonePanel;
});
//# sourceMappingURL=ClonePanel.js.map