import {
    mix
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import { POINT_LAYER } from '../../enums/constants';
import { PointLayerMixin } from './point-mixin';

/**
 * This layer is used to create various symbols for each data point. This is commonly used in
 * scatterplot visualizations. The mark type of this layer is ```point```.
 *
 * @public
 *
 * @class
 * @module PointLayer
 * @extends BaseLayer
 */
export default class PointLayer extends mix(BaseLayer).with(PointLayerMixin) {
    static formalName () {
        return POINT_LAYER;
    }
}
