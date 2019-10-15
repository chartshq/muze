import {
    mix
} from 'muze-utils';
import { BaseLayer, BaseLayerMixin } from '../../base-layer';
import { LineLayerMixin } from './line-mixin';
import { LINE_LAYER } from '../../enums/constants';

/**
 * This layer is used to render straight or smoothed line paths. The mark type of this layer is ```line```.
 *
 * @public
 *
 * @class
 * @module LineLayer
 * @extends BaseLayer
 */
export default class LineLayer extends mix(BaseLayer).with(BaseLayerMixin, LineLayerMixin) {
    static formalName () {
        return LINE_LAYER;
    }
}
