import {
    mix
} from 'muze-utils';
import { BaseLayerMixin, BaseLayer } from '../../base-layer';
import { ArcLayerMixin } from './arc-mixin';

/**
 * Arc Layer creates a plot with polar coordinates.
 *
 * @public
 *
 * @class
 * @module ArcLayer
 * @extends BaseLayer
 */
export default class ArcLayer extends mix(BaseLayer).with(BaseLayerMixin, ArcLayerMixin) {
    static formalName () {
        return 'arc';
    }
}
