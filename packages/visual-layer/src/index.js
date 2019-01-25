 import { AreaLayer } from './layers/area';
 import { ArcLayer } from './layers/arc';
 import { LineLayer } from './layers/line';
 import { TextLayer } from './layers/text';
 import { PointLayer } from './layers/point';
 import { BarLayer } from './layers/bar';
 import { TickLayer } from './layers/tick';
 import { SimpleLayer } from './simple-layer';
 import { BaseLayer } from './base-layer';
 import * as LAYER_TYPES from './enums/layer-types';
 import layerFactory from './layer-factory';
 import layerRegistry from './layer-registry';

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
    LAYER_TYPES
};
