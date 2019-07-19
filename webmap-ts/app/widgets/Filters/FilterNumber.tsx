/// <amd-dependency path="esri/core/tsSupport/declareExtendsHelper" name="__extends" />
/// <amd-dependency path="esri/core/tsSupport/decorateHelper" name="__decorate" />

import { subclass, declared, property } from "esri/core/accessorSupport/decorators";

import on = require("dojo/on");
import domStyle = require("dojo/dom-style");

import { tsx } from "esri/widgets/support/widget";

import i18n = require("dojo/i18n!../nls/resources");
import FilterItemBase = require("./FilterItemBase");

@subclass("esri.widgets.FilterNumber")
class FilterNumber extends declared(FilterItemBase) {
  private minValueNode: HTMLInputElement;
  private maxValueNode: HTMLInputElement;

  @property({ readOnly: true })
  get Expression(): string {
      return (this as any).getFilterExpresion();
  };

  @property()
  value: any;

  render() {
    const id1 = "id1";
    const id2 = "id2";
    const format = "";
    return (
      <div class="filter__grid-container">
        <select autofocus tabindex="0"
          afterCreate={this._criteriaCreated}
          class="filter__grid-item filter__grid-criteria"
          aria-label={i18n.FilterItem.selectCriteria}
        >
          <option value=" = ">{i18n.FilterItem.equal}</option>
          <option value=" != ">{i18n.FilterItem.notEqual}</option>
          <option value=" < ">{i18n.FilterItem.lessThen}</option>
          <option value=" > ">{i18n.FilterItem.moreThen}</option>
          <option value=" BETWEEN ">{i18n.FilterItem.between}</option>
          <option value=" NOT BETWEEN ">{i18n.FilterItem.notBetween}</option>
        </select>
        <div class="filter__grid-item filter__grid-minValue">
          <input type="number"
            class="filter-filterItem__textBox--number"
            afterCreate={this._addedMinValue}
            aria-label={i18n.FilterItem.enterValueToMatch}
            title={i18n.FilterItem.enterValueToMatch}
          />
        </div>
        <div class="filter__grid-item filter__grid-maxValue">
          <input type="number"
            class="filter-filterItem__textBox--number"
            style="display: none;"
            afterCreate={this._addedMaxValue}
            aria-label={i18n.FilterItem.enterLastValue}
            title={i18n.FilterItem.enterLastValue}
          />
        </div>
      </div>
    )
  }

  private _addedMinValue = (element: Element) => {
    this.minValueNode = element as HTMLInputElement;
  }

  private _addedMaxValue = (element: Element) => {
    this.maxValueNode = element as HTMLInputElement;
  }

  private criteriaElement: HTMLSelectElement;
  private _criteriaCreated = (element: Element) => {
    this.criteriaElement = element as HTMLSelectElement;
    this.own(on(element, "change", (event) => {
      switch (this._getBetweenMode()) {
        case false:
          domStyle.set(this.maxValueNode, 'display', 'none');
          break;
        case true:
          domStyle.set(this.maxValueNode, 'display', '');
          break;
      }

    }))
  }

  private _getBetweenMode = () => {
    const criteria = this.criteriaElement.value;
    return criteria === ' BETWEEN ' || criteria === ' NOT BETWEEN ';
  }

  public getFilterExpresion = (): string => {
    const minNumb = this.minValueNode.value;
    if (minNumb) {
      if (this._getBetweenMode()) {
        const maxNumb = this.maxValueNode.value;
        if (maxNumb) {
          const where = `${this.field.name}${this.criteriaElement.value}'${minNumb}' AND '${maxNumb}'`;
          // console.log("filterNumber->filterExpression", where);
          return where;
        }
        else {
          return null;
        }
      } else {
        const where = `${this.field.name}${this.criteriaElement.value}'${minNumb}'`;
        // console.log("filterNumber->filterExpression", where);
        return where;
      }
    }
    else {
      return null;
    }
  }

}

export = FilterNumber;
