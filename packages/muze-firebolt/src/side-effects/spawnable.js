import { makeElement } from 'muze-utils';

import GenericSideEffect from './generic';

/**
 * Any side effect which will add any new element to the chart like drawing a rectangular box or any annotation over
 * the chart needs to inherit this class. This class has methods which returns the container where the dom elements
 * needs to be created.
 *
 * To use this,
 * ```
 *      const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
 *
 *      class SelectionBox extends SpawnableSideEffect {
 *          static formalName () {
 *              return 'selectionBox';
 *          }
 *
 *          // Implement the logic of applying the style here.
 *          apply () {
 *          }
 *      }
 * ```
 * @public
 * @class
 * @extends GenericSideEffect
 * @module SpawnableSideEffect
 */
export default class SpawnableSideEffect extends GenericSideEffect {
    /**
     * Creates a html or svg element in the container.
     *
     * @public
     * @param {SVGElement|HTMLElement} container Container where the dom element will be rendered.
     * @param {string} elemType Type of dom element.
     * @param {Array} data Array of objects with which the dom elements will be binded.
     * @param {string} className class name of the element.
     *
     * @return {Selection} D3 Selection of the element.
     */
    createElement (container, elemType, data, className, callbacks) {
        return makeElement(container, elemType, data, className, callbacks);
    }

    /**
     * Returns the drawing information for side effect like svg container, dimensions of the visual unit.
     *
     * @public
     * @return {Object} Drawing information for side effect.
     * ```
     *      sideEffectGroup: // svg container where the side effect needs to be appended.
     *      svgContainer: // svg container of the {@link VisualUnit}.
     *      htmlContainer: // html div container of the {@link VisualUnit}.
     *      width: // Width of the {@link VisualUnit}
     *      height: // Height of the {@link VisualUnit}
     * ```
     */
    drawingContext (...drawingContext) {
        if (drawingContext.length) {
            this._drawingContext = drawingContext[0];
            return this;
        }
        return this._drawingContext();
    }

    show () {
        return this;
    }

    hide () {
        return this;
    }
}
