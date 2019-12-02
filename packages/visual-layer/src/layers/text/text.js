import {
    mix
} from 'muze-utils';
import { BaseLayer, BaseLayerMixin } from '../../base-layer';
import { TextLayerMixin } from './text-mixin';

/**
 * This layer is used to create labels for each data point. It has an encoding property ```text```
 * which determines from which field's data the value of the label will be taken. The text encoding
 * property is necessary for the layer to render the text.The mark type of this layer is ```text```.
 *
 * @public
 *
 * @class
 * @module TextLayer
 * @extends BaseLayer
 */
export default class TextLayer extends mix(BaseLayer).with(BaseLayerMixin, TextLayerMixin) {
    static formalName () {
        return 'text';
    }
}
