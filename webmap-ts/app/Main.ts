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

import ApplicationBase = require("ApplicationBase/ApplicationBase");

import i18n = require("dojo/i18n!./nls/resources");

import BorderContainer = require("dijit/layout/BorderContainer");
import ContentPane = require("dojox/layout/ContentPane");

import registry = require("dijit/registry");
import domConstruct = require("dojo/dom-construct");

const CSS = {
  loading: "configurable-application--loading"
};

import {
  createMapFromItem,
  createView,
  getConfigViewProperties,
  getItemTitle,
  findQuery,
  goToMarker
} from "ApplicationBase/support/itemUtils";

import {
  setPageLocale,
  setPageDirection,
  setPageTitle
} from "ApplicationBase/support/domHelper";

import {
  ApplicationConfig,
  ApplicationBaseSettings
} from "ApplicationBase/interfaces";

class MapExample {
  //--------------------------------------------------------------------------
  //
  //  Properties
  //
  //--------------------------------------------------------------------------

  //----------------------------------
  //  ApplicationBase
  //----------------------------------
  base: ApplicationBase = null;

  //--------------------------------------------------------------------------
  //
  //  Public Methods
  //
  //--------------------------------------------------------------------------

  public init(base: ApplicationBase): void {
    if (!base) {
      console.error("ApplicationBase is not defined");
      return;
    }
    console.log("Config", base.config);
    this.base = base;

    const { config, results, settings } = base;
    const { find, marker } = config;
    const { webMapItems } = results;

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    setPageLocale(base.locale);
    setPageDirection(base.direction);

    const validWebMapItems = webMapItems.map(response => {
      return response.value;
    });

    const firstItem = validWebMapItems[0];

    if (!firstItem) {
      console.error("Could not load an item to display");
      return;
    }

    setPageTitle(config.title);
    document.getElementById("panelText").innerHTML = config.title;

    this.colors(config);
    this.createUI();

    const portalItem: __esri.PortalItem = this.base.results.applicationItem
      .value;
    const appProxies =
      portalItem && portalItem.applicationProxies
        ? portalItem.applicationProxies
        : null;

    const viewContainerNode = document.getElementById("viewContainer");
    const defaultViewProperties = getConfigViewProperties(config);

    validWebMapItems.forEach(item => {
      const viewNode = document.createElement("div");
      viewContainerNode.appendChild(viewNode);

      const container = {
        container: viewNode
      };

      const viewProperties = {
        ...defaultViewProperties,
        ...container
      };

      createMapFromItem({ item, appProxies }).then(map =>
        createView({
          ...viewProperties,
          map
        }).then(view => {
          findQuery(find, view).then(() => goToMarker(marker, view))
        }
        )
      );
    });

    document.body.classList.remove(CSS.loading);
  }

  colors = (config) => {
    const configurableStyles = domConstruct.create("style", {
        id: "configurableStyles"
        }, document.head);

        const focusColor = config.focusColor;
        const hoverColor = config.hoverColor;
        const activeColor = config.activeColor;

        configurableStyles.innerHTML = `
.bg { background: ${config.theme}; }
.fc { color: ${config.color}; }
:focus { outline-color: ${focusColor}; }
.dijitSplitterV {
  background: ${config.color};
  border-color: ${config.theme};
}
.esri-widget--button {
  background: ${config.theme};
  color: ${config.color};
  margin: 1px !important;
}
.esri-widget--button:hover {
  background: ${hoverColor};
  color: ${config.color};
}`;
  }

  createUI = () => {
    const borderContainer = new BorderContainer(
      {
          gutters: false,
          liveSplitters: true,
          id: "borderContainer"
      }
  );

  const contentPaneTop = new ContentPane({
      region: "top",
      splitter: false,
      style: "padding:0;",
      content: document.getElementById("panelTitle")
  });
  borderContainer.addChild(contentPaneTop);

  const contentPaneLeft = new ContentPane({
      region: "leading",
      splitter: "true",
      style: "width:425px; padding:0; overflow: none;",
      content: document.getElementById("leftPanel"),
      class: "splitterContent"
  });
  borderContainer.addChild(contentPaneLeft);

  const contentPaneRight = new ContentPane({
      style: "padding:1px; background-color:white;",
      region: "center",
      splitter: "true",
      // class: "bg",
      content: document.getElementById("mapPlace")
  });
  borderContainer.addChild(contentPaneRight);

  borderContainer.placeAt(document.body);

  borderContainer.startup();
  }
}

export = MapExample;
