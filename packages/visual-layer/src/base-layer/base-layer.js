import {
    mix
} from 'muze-utils';
import { SimpleLayer } from '../simple-layer';
import { BaseLayerMixin } from './base-mixin';
import { BASE_LAYER } from '../enums/constants';

/**
 * An abstract class which gives definition of common layer functionality like
 * - transforming data for various modes. Supported modes: identity, group and stack.
 * - calculating data domain
 * - linking dependent layers
 * - merging policy of configuration
 * - interaction sideffect helpers
 * - retrieving dom elements from data using id
 * - retrieving the physical dimensions of marks
 * - disposing layer
 *
 * Every layer has to extend base layer and give concrete definition.
 * This layer does not have any default visual. A new layer has to define the logic of `render` for rendering the
 * visuals
 *
 * @public
 * @class
 * @module BaseLayer
 */
export default class BaseLayer extends mix(SimpleLayer).with(BaseLayerMixin) {
    /**
     * Determines a name for a layer. This name of the layer is used in the input data to refer to this layer.
     * ```
     *  .layers([
     *      mark: 'bar',
     *      encoding: { ... }
     *  ])
     * ```
     *
     * @static
     * @public
     *
     * @return {string} name of layer
     */
    static formalName () {
        return BASE_LAYER;
    }
}
