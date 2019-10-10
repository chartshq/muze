import { AreaLayer, AreaLayerMixin } from './layers/area';
import { ArcLayer, ArcLayerMixin } from './layers/arc';
import { LineLayer, LineLayerMixin } from './layers/line';
import { TextLayer, TextLayerMixin } from './layers/text';
import { PointLayer, PointLayerMixin } from './layers/point';
import { BarLayer, BarLayerMixin } from './layers/bar';
import { TickLayer, TickLayerMixin } from './layers/tick';
import { SimpleLayer } from './simple-layer';
import { BaseLayer, BaseLayerMixin } from './base-layer';
import * as LAYER_TYPES from './enums/layer-types';
import layerFactory from './layer-factory';
import layerRegistry from './layer-registry';
import { ENCODING } from './enums/constants';
import * as pointLayerHelpers from './layers/point/helper';
import * as commonHelpers from './helpers';
import * as enums from './enums';

const helpers = Object.assign(commonHelpers, {
    pointLayerHelpers
});

const layerMixins = {
    BarLayerMixin,
    BaseLayerMixin,
    LineLayerMixin,
    AreaLayerMixin,
    PointLayerMixin,
    TextLayerMixin,
    TickLayerMixin,
    ArcLayerMixin
};

export {
    BaseLayer,
    BarLayer,
    LineLayer,
    AreaLayer,
    PointLayer,
    ArcLayer,
    TextLayer,
    TickLayer,
    layerFactory,
    SimpleLayer,
    layerRegistry,
    LAYER_TYPES,
    ENCODING,
    helpers,
    enums,
    layerMixins
};
