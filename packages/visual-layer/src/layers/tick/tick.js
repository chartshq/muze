import { mix } from 'muze-utils';
import { PointLayerMixin } from '../point';
import { BaseLayerMixin, BaseLayer } from '../../base-layer';
import { TickLayerMixin } from './tick-mixin';

/**
 * This layer is used to create small lines. The orientation of the line is determined by the positional
 * encoding properties x0 and y0. The mark type of the layer is ```tick```.
 *
 * @public
 *
 * @class
 * @module TickLayer
 * @extends BaseLayer
 */
export default class TickLayer extends mix(BaseLayer).with(BaseLayerMixin, PointLayerMixin, TickLayerMixin) {
    static formalName () {
        return 'tick';
    }
}
