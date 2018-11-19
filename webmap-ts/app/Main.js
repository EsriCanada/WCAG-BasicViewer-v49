/*
  Copyright 2017 Esri

  Licensed under the Apache License, Version 2.0 (the "License");

  you may not use this file except in compliance with the License.

  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software

  distributed under the License is distributed on an "AS IS" BASIS,

  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.

  See the License for the specific language governing permissions and

  limitations under the License.​
*/
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
define(["require", "exports", "dijit/layout/BorderContainer", "dojox/layout/ContentPane", "ApplicationBase/support/itemUtils", "ApplicationBase/support/domHelper"], function (require, exports, BorderContainer, ContentPane, itemUtils_1, domHelper_1) {
    "use strict";
    var CSS = {
        loading: "configurable-application--loading"
    };
    var MapExample = /** @class */ (function () {
        function MapExample() {
            //--------------------------------------------------------------------------
            //
            //  Properties
            //
            //--------------------------------------------------------------------------
            //----------------------------------
            //  ApplicationBase
            //----------------------------------
            this.base = null;
        }
        //--------------------------------------------------------------------------
        //
        //  Public Methods
        //
        //--------------------------------------------------------------------------
        MapExample.prototype.init = function (base) {
            if (!base) {
                console.error("ApplicationBase is not defined");
                return;
            }
            console.log("Config", base.config);
            this.base = base;
            var config = base.config, results = base.results, settings = base.settings;
            var find = config.find, marker = config.marker;
            var webMapItems = results.webMapItems;
            domHelper_1.setPageLocale(base.locale);
            domHelper_1.setPageDirection(base.direction);
            var validWebMapItems = webMapItems.map(function (response) {
                return response.value;
            });
            var firstItem = validWebMapItems[0];
            if (!firstItem) {
                console.error("Could not load an item to display");
                return;
            }
            domHelper_1.setPageTitle(config.title);
            var portalItem = this.base.results.applicationItem
                .value;
            var appProxies = portalItem && portalItem.applicationProxies
                ? portalItem.applicationProxies
                : null;
            var viewContainerNode = document.getElementById("viewContainer");
            var defaultViewProperties = itemUtils_1.getConfigViewProperties(config);
            validWebMapItems.forEach(function (item) {
                var viewNode = document.createElement("div");
                viewContainerNode.appendChild(viewNode);
                var container = {
                    container: viewNode
                };
                var viewProperties = __assign({}, defaultViewProperties, container);
                itemUtils_1.createMapFromItem({ item: item, appProxies: appProxies }).then(function (map) {
                    return itemUtils_1.createView(__assign({}, viewProperties, { map: map })).then(function (view) {
                        itemUtils_1.findQuery(find, view).then(function () { return itemUtils_1.goToMarker(marker, view); });
                    });
                });
            });
            var borderContainer = new BorderContainer({
                gutters: false,
                liveSplitters: true,
                id: "borderContainer"
            });
            var contentPaneTop = new ContentPane({
                region: "top",
                splitter: false,
                style: "padding:0;",
                content: document.getElementById("panelTitle")
            });
            borderContainer.addChild(contentPaneTop);
            var contentPaneLeft = new ContentPane({
                region: "leading",
                splitter: "true",
                style: "width:425px; padding:0; overflow: none;",
                content: document.getElementById("leftPanel"),
                class: "splitterContent"
            });
            borderContainer.addChild(contentPaneLeft);
            var contentPaneRight = new ContentPane({
                style: "padding:1px; background-color:white;",
                region: "center",
                splitter: "true",
                // class: "bg",
                content: document.getElementById("mapPlace")
            });
            borderContainer.addChild(contentPaneRight);
            borderContainer.placeAt(document.body);
            borderContainer.startup();
            document.body.classList.remove(CSS.loading);
        };
        return MapExample;
    }());
    return MapExample;
});
//# sourceMappingURL=Main.js.map