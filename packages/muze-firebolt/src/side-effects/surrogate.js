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
    /**
     * Applies or removes interaction styles from plot elements. An array of row ids needs to be passed
     * which identifies the plot elements and applies styles to them.
     *
     * To apply the interaction style,
     * ```
     *      const entryRowIds = entrySet[0].uids;
     *      const interactionStyle = [{
     *          type: 'fill',
     *          intensity: [0, 0, 15, 0] // hsla configuration
     *      }];
     *
     *      this.applyInteractionStyle(entryRowIds, interactionStyle, 'brighten', true);
     * ```
     * @public
     * @param {Array} set Array of row ids.
     * @param {Array} config Style configuration.
     * @param {Object} config[0] fill or stroke configuration.
     * @param {string} config[0].type Type of style - fill or stroke.
     * @param {Array} config[0].intensity hsla configuration.
     * @param {string} interactionType Type of interaction. This is needed for storing the styles for
     * each type of interaction in the plot elements.
     * @param {boolean} apply Whether to apply or remove the interaction style.
     *
     * @return {SurrogateSideEffect} Instance of surrogate side effect.
     */
    applyInteractionStyle (set, config = {}, layers) {
        const { interactionType, apply, reset = false } = config;
        const allLayers = layers || this.firebolt.context.layers();
        allLayers.forEach((layer) => {
            const { interactive } = layer.config();
            if (interactive !== false) {
                const layerFields = layer.data().getFieldsConfig();
                const filteredUids = set.uids.filter(([, measures = []]) => measures.every(m => m in layerFields))
                    .map(d => d[0]);
                const options = { apply, reset, styles: null };
                layer.applyInteractionStyle(interactionType, filteredUids, options);
            }
        });
        return this;
    }
}
