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
define(["require", "exports", "esri/core/tsSupport/declareExtendsHelper", "esri/core/tsSupport/decorateHelper", "esri/core/accessorSupport/decorators", "esri/widgets/Widget", "esri/widgets/support/widget"], function (require, exports, __extends, __decorate, decorators_1, Widget, widget_1) {
    "use strict";
    var ClonePanel = /** @class */ (function (_super) {
        __extends(ClonePanel, _super);
        function ClonePanel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ClonePanel.prototype.render = function () {
            return (widget_1.tsx("div", { class: "ClonePanel" },
                widget_1.tsx("div", { class: "toolbar" },
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/pickRoad2.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onPickRoadClicked", title: "Pick Road", "aria-label": "Pick Road" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/Cut.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onCutClicked", title: "Cut Line", "aria-label": "Cut Line" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/Flip1.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onFlipSideClicked", title: "Flip Side", "aria-label": "Flip Side" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/Flip2.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onReverseClicked", title: "Reverse Direction", "aria-label": "Reverse Direction" }),
                    widget_1.tsx("input", { type: "image", src: "../images/icons_transp/restart.bgwhite.24.png", class: "button", "data-dojo-attach-event": "click:_onRestartCutsClicked", title: "Restart Cuts", "aria-label": "Restart Cuts" })),
                widget_1.tsx("div", { class: "clone_panel-content" },
                    widget_1.tsx("table", null,
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
                                widget_1.tsx("span", { style: "margin-left: 4px;", "data-dojo-attach-point": "distRoad" }, "20"))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "polylineLength" }, "Length (meters):")),
                            widget_1.tsx("td", null,
                                widget_1.tsx("span", { id: "polylineLength", "data-dojo-attach-point": "polylineLength" }))),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", { style: "border-top: 1px solid gray; border-left: 1px solid gray;" },
                                widget_1.tsx("label", { for: "unitCount" }, "Unit Count:")),
                            widget_1.tsx("td", { style: "border-top: 1px solid gray; border-right: 1px solid gray;" })),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", { style: "border-bottom: 1px solid gray; border-left: 1px solid gray;" },
                                widget_1.tsx("label", { for: "unitDist" }, "Unit Distance:")),
                            widget_1.tsx("td", { style: "border-bottom: 1px solid gray; border-right: 1px solid gray;" })),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "StreeNumStart" }, "Street # Start:")),
                            widget_1.tsx("td", null)),
                        widget_1.tsx("tr", null,
                            widget_1.tsx("th", null,
                                widget_1.tsx("label", { for: "StreeNumStep" }, "Street # Step:")),
                            widget_1.tsx("td", null)))),
                widget_1.tsx("div", { class: "clone_panel-footer" })));
        };
        ClonePanel = __decorate([
            decorators_1.subclass("esri.widgets.ClonePanel")
        ], ClonePanel);
        return ClonePanel;
    }(decorators_1.declared(Widget)));
    return ClonePanel;
});
//# sourceMappingURL=ClonePanel.js.map