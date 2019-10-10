import { mix } from 'muze-utils';
import { AREA_LAYER } from '../../enums/constants';
import { BaseLayer, BaseLayerMixin } from '../../base-layer';
import { LineLayerMixin } from '../line/line-mixin';
import { AreaLayerMixin } from './area-mixin';

/**
 * Area layer renders a closed path. The mark type of this layer is ```area```. This layer can be used
 * to create stacked or multi-series areas and vertical range area plots by using the encoding properties.
 *
 * To create this layer using layer configuration from canvas,
 * ```
 *      canvas.layers([{
 *          mark: 'area',
 *          transform: {
 *              type: 'stack' // Produces a stacked area.
 *          }
 *      }]);
 * ```
 *
 * @public
 *
 * @class
 * @module AreaLayer
 * @extends LineLayer
 */
export default class AreaLayer extends mix(BaseLayer).with(BaseLayerMixin, LineLayerMixin, AreaLayerMixin) {
    static formalName () {
        return AREA_LAYER;
    }
}

