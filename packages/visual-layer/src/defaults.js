import { AreaLayer } from './layers/area';
import { ArcLayer } from './layers/arc';
import { LineLayer } from './layers/line';
import { TextLayer } from './layers/text';
import { PointLayer } from './layers/point';
import { BarLayer } from './layers/bar';
import { BaseLayer } from './base-layer';
import * as CONSTANTS from './enums/constants';
import { TickLayer } from './layers/tick';

export const DEFAULT_LAYERS = {
    [CONSTANTS.AREA_LAYER]: AreaLayer,
    [CONSTANTS.ARC_LAYER]: ArcLayer,
    [CONSTANTS.LINE_LAYER]: LineLayer,
    [CONSTANTS.TEXT_LAYER]: TextLayer,
    [CONSTANTS.POINT_LAYER]: PointLayer,
    [CONSTANTS.TICK_LAYER]: TickLayer,
    [CONSTANTS.BAR_LAYER]: BarLayer,
    [CONSTANTS.BASE_LAYER]: BaseLayer
};
