/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import dom = require("dojo/dom");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");

@subclass("esri.widgets.FeaturesListItem")
  class FeaturesListItem extends declared(Widget) {

    @property()
    layer: __esri.Layer;
  
    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    tool: Tool;

    render() {
        const _title = "title";
        const _layerId ="layerId";
        const _featureId = "featureId";
        const id = `${_layerId}_${_featureId}`;
        return (
<div class="featureItem">
	<table width="100%" role="presentation">
		<tr>
			<th valign="top" rowspan="3">
				<input id="featureButton_${id}" class="checkbox" type="checkbox" name="featureItem" value="${_layerId},${_featureId}" 
				data-dojo-attach-event="onchange: featureExpand"/>
			</th>
			<th valign="top" align="left" width="100%">
				<label for="featureButton_${id}" class="checkbox">${_title}</label>
			</th>
		</tr>
		<tr class="featureControls featureItem_${id} hideAttr">
			<td>
				<input id="panBtn_${id}" class="fc bg pageBtn" type="button" value="${_panTo}" 
				data-dojo-attach-event="onclick: featurePan"
				data-layerId="${_layerId}" data-featureId="${_featureId}"/>

				<input id="zoomBtn_${_layerId}_${_featureId}" class="fc bg pageBtn" type="button" value="${_zoomTo}" 
				data-dojo-attach-event="onclick: featureZoom"
				data-layerId="${_layerId}" data-featureId="${_featureId}"/>
			</td>
		</tr>
		<tr class="featureContent featureItem_${id} hideAttr">
			<td class="featureContentPane">
			</td>
		</tr>
	</table>
</div>
        );
    }

    constructor() {
        super();
    }

}

export = FeaturesListItem;
