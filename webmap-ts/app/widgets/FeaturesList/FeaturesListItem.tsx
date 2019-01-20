/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import {subclass, declared, property} from "esri/core/accessorSupport/decorators";
import Widget = require("esri/widgets/Widget");
import dom = require("dojo/dom");
import domClass = require("dojo/dom-class");
import query = require("dojo/query");
import on = require("dojo/on");
import domConstruct = require("dojo/dom-construct");
import i18n = require("dojo/i18n!../nls/resources");
import { tsx } from "esri/widgets/support/widget";
import Tool = require("../toolbar/Tool");
import FeatureList = require("./FeaturesList");


@subclass("esri.widgets.FeaturesListItem")
  class FeaturesListItem extends declared(Widget) {

    @property()
    mapView: __esri.MapView | __esri.SceneView;

    @property()
    feature: any;

    @property()
    featureList: FeatureList;
  
    @property()
    tool: Tool;

    render() {
        const title = this.feature.layer.popupTemplate.title;
        console.log("feature", this.feature, title, this.feature.layer.popupTemplate, this.feature.layer.popupTemplate._getTitleFields(this.feature), this.feature.attributes);
        const _title = this.feature.layer.popupTemplate.title.mixIn(this.feature.attributes);
        const _layerId = this.feature.layer.id;
        const _featureId = this.feature.id;
        const id = `${_layerId}_${_featureId}`;
        return (
<div class="featureItem">
	<table width="100%" role="presentation">
		<tr>
			<th valign="top" rowspan="3">
				<input class="checkbox" type="checkbox" name="featureItem" 
				afterCreate={this._addedCheckBox}/>
			</th>
			<th valign="top" align="left" width="100%">
				<label for="featureButton_{id}" class="checkbox">{_title}</label>
			</th>
		</tr>
		<tr class="featureControls featureItem_{id} hideAttr">
			<td>
				<input id="panBtn_{id}" class="fc bg pageBtn" type="button" value={i18n.featureList.panTo} 
				data-dojo-attach-event="onclick: featurePan"
				data-layerId="{_layerId}" data-featureId={_featureId}/>

				<input id="zoomBtn_{id}" class="fc bg pageBtn" type="button" value={i18n.featureList.zoomTo} 
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

    private _checkBox : HTMLInputElement;
    private _addedCheckBox = (element:Element) => {
        this._checkBox = element as HTMLInputElement;
        const _layerId = this.feature.layer.id;
        const _featureId = this.feature.attributes[this.feature.objectIdFieldName];
        this._checkBox.id = `featureButton_${_layerId}_${_featureId}`;
        this._checkBox.value = this.feature.layer.id+","+this.feature.id;
        this.own(on(this._checkBox, "change", this._featureExpand));
    }

    private _featureExpand = (event) => {
        this.__featureExpand(event.target);
    }

    private _prevSelected: any;

    private __featureExpand = (checkBox : HTMLInputElement, restore = false) => {
        if(this.featureList._prevSelected && !restore) {
            query('.featureItem_'+this.featureList._prevSelected).forEach((e : HTMLElement) => {
                // dojo.removeClass(e, 'showAttr');
                domClass.add(e, "hideAttr");
                const li = e.closest('li');
                domClass.remove(li, "borderLi");

            });
            query('#featureButton_'+this.featureList._prevSelected).forEach((e : HTMLInputElement) => {
                e.checked=false;
            });
        }

        const values = checkBox.value.split(',');
        const r = this.featureList.tasks.filter(t => t.layer.id == values[0]);
        console.log("tasks", values[0], values[1], this.featureList.tasks, r);
        // const objectIdFieldName = r.layer.objectIdField;
        const fid = values[1];
        const layer = this.feature.layer;//r[0].layer;

        this.mapView.graphics.forEach((gr: any) => {
            if(gr.name && gr.name === 'featureMarker') {
                this.mapView.graphics.remove(gr);
            }
        });

        // lang.hitch(this, this.featureList.showBadge(checkBox.checked));

        const li : HTMLLIElement = this.container as HTMLLIElement;
        domClass.add(li, 'borderLi');
        if(checkBox.checked)
        {
            this._prevSelected = this.featureList._prevSelected = values[0]+'_'+fid;
            const featureControls = li.querySelector('.featureControls');
            domClass.remove(featureControls, 'hideAttr');
            const featureContent = li.querySelector('.featureContent');
            domClass.remove(featureContent, 'hideAttr');
            const featureContentPane = li.querySelector('.featureContentPane');

            // const q = new Query();
            // q.where = objectIdFieldName+"="+fid;
            // q.outFields = layer.fields.map(function(fld) {return fld.name;});//objectIdFieldName];
            // q.returnGeometry = true;
            // r.task.execute(q).then(lang.hitch(this, function(ev) {
            //     const feature = ev.features[0];
            //     if(!featureContentPane.attributes.hasOwnProperty('widgetid')) {
            //         const contentPane = new ContentPane({ }, featureContentPane);
            //         contentPane.startup();

            //         const myContent = layer.infoTemplate.getContent(feature);

            //         contentPane.set("content", myContent).then(lang.hitch(this, function() {
            //             const mainView = featureContentPane.querySelector('.esriViewPopup');
            //             if(mainView) {
            //                 domAttr.set(mainView, 'tabindex',0);

            //                 const mainSection = mainView.querySelector('.mainSection');
            //                 if(mainSection) {
            //                     domConstruct.destroy(mainSection.querySelector('.header'));
            //                 }

            //                 const attrTables = query('.attrTable', mainSection);
            //                 if(attrTables && attrTables.length > 0) {
            //                     for(let i = 0; i<attrTables.length; i++) {
            //                         const attrTable = attrTables[i];
            //                         // domAttr.set(attrTable, 'role', 'presentation');
            //                         const attrNames = query('td.attrName', attrTable);
            //                         if(attrNames && attrNames.length > 0) {
            //                             for(let j = 0; j<attrNames.length; j++) {
            //                                 attrNames[j].outerHTML = attrNames[j].outerHTML.replace(/^<td/, '<th').replace(/td>$/, 'th>');
            //                             }
            //                         }
            //                     }
            //                 }

            //                 const images = query('.esriViewPopup img', myContent.domNode);
            //                 if(images) {
            //                     images.forEach(function(img) {
            //                         const alt = domAttr.get(img, 'alt');
            //                             if(img.src.startsWith('http:') && location.protocol==='https:') {
            //                             img.src = img.src.replace('http:', 'https:');
            //                         }
            //                         if(!alt) {
            //                             domAttr.set(img,'alt','Attached Image');
            //                         } else {
            //                             domAttr.set(img,'tabindex',0);
            //                             if(!domAttr.get(img, 'title'))
            //                             {
            //                                 domAttr.set(img,'title', alt);
            //                             }
            //                         }
            //                     });
            //                 }
            //             }
            //         }));
            //     }

            //     li.scrollIntoView({block: "start", inline: "nearest", behavior: "smooth"});

            //     let markerGeometry = null;
            //     let marker = null;

            //     switch (feature.geometry.type) {
            //         case "point":
            //             markerGeometry = feature.geometry;
            //             marker = this.featureList.markerSymbol;
            //             break;
            //         case "extent":
            //             markerGeometry = feature.getCenter();
            //             break;
            //         case "polyline" :
            //             markerGeometry = feature.geometry;
            //             marker = new CartographicLineSymbol(
            //                 CartographicLineSymbol.STYLE_SOLID, new Color([0, 127, 255]), 10,
            //                 CartographicLineSymbol.CAP_ROUND,
            //                 CartographicLineSymbol.JOIN_ROUND, 5);
            //             break;
            //         default:
            //             // if the feature is a polygon
            //             markerGeometry = feature.geometry;
            //             marker = new SimpleFillSymbol(
            //                 SimpleFillSymbol.STYLE_SOLID,
            //                 new SimpleLineSymbol(
            //                     SimpleLineSymbol.STYLE_SOLID,
            //                     new Color([0, 127, 255]), 3),
            //                     new Color([0, 127, 255, 0.25]));
            //             break;
            //     }

            //     const gr = new Graphic(markerGeometry, marker);
            //     gr.name = 'featureMarker';
            //     layer._map.graphics.add(gr);
            // }));
        } else {
            domClass.remove(li, 'borderLi');
            query('.featureItem_'+this.featureList._prevSelected).forEach(function(e) {
                domClass.add(e, 'hideAttr');
            });
            this.featureList._prevSelected = null;
        }
    }
}

export = FeaturesListItem;
