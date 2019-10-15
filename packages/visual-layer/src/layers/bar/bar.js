import { mix } from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import { BAR_LAYER } from '../../enums/constants';
import { BarLayerMixin } from './bar-mixin';
import { BaseLayerMixin } from '../../base-layer/base-mixin';
import './styles.scss';

/**
 * Bar layer creates rectangle marks. The mark type of this layer is ```bar```. This layer can be used
 * to create stacked or grouped bars, range bars, heatmap plots and also reference bands by using
 * the encoding properties.
 *
 * @public
 *
 * @class
 * @module BarLayer
 * @extends BaseLayer
 */
export default class BarLayer extends mix(BaseLayer).with(BaseLayerMixin, BarLayerMixin) {
    static formalName () {
        return BAR_LAYER;
    }
}
