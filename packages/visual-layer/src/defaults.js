import { AreaLayer } from './layers/area';
import { ArcLayer } from './layers/arc';
import { LineLayer } from './layers/line';
import { TextLayer } from './layers/text';
import { PointLayer } from './layers/point';
import { BarLayer } from './layers/bar';
import { BaseLayer } from './base-layer';
import * as LAYER_TYPES from './enums/layer-types';
import { TickLayer } from './layers/tick';

export const DEFAULT_LAYERS = {
    [LAYER_TYPES.AREA_LAYER]: AreaLayer,
    [LAYER_TYPES.ARC_LAYER]: ArcLayer,
    [LAYER_TYPES.LINE_LAYER]: LineLayer,
    [LAYER_TYPES.TEXT_LAYER]: TextLayer,
    [LAYER_TYPES.POINT_LAYER]: PointLayer,
    [LAYER_TYPES.TICK_LAYER]: TickLayer,
    [LAYER_TYPES.BAR_LAYER]: BarLayer,
    [LAYER_TYPES.BASE_LAYER]: BaseLayer
};
