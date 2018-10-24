import GenericSideEffect from './generic';

/**
 * This class is inherited by all side effects which changes the look of any existing elements in the visualization.
 * For example, if a side effect wants to change the color of bar plots, then it is a surrogate side effect.
 *
 * To use this,
 * ```
 *      const SurrogateSideEffect = muze.SideEffects.standards.SurrogateSideEffect;
 *
 *      class BarColorChanger extends SurrogateSideEffect {
 *          static formalName () {
 *              return 'colorChanger';
 *          }
 *
 *          // Implement the logic of applying the style here.
 *          apply () {
 *          }
 *      }
 * ```
 * @public
 *
 * @module SurrogateSideEffect
 * @class
 * @extends GenericSideEffect
 */
export default class SurrogateSideEffect extends GenericSideEffect {
    applyInteractionStyle (set, config = {}, interactionType, apply) {
        const layers = this.firebolt.context.layers();
        layers.forEach(layer => layer.config().interactive !== false &&
            layer.applyInteractionStyle(interactionType, set.uids, apply));
    }
}
