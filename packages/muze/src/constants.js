import { GradientLegend, DiscreteLegend, StepLegend } from '@chartshq/muze-legend';

/**
 * Contants to be used as attr
 */
export const ROWS = 'rows';
export const COLUMNS = 'columns';
export const DATA = 'data';
export const COLOR = 'color';
export const SHAPE = 'shape';
export const SIZE = 'size';
export const DETAIL = 'detail';
export const LAYERS = 'layers';
export const TRANSFORM = 'transform';
export const INITIALIZED = 'isInitialized';
export const SOURCE = 'source';
export const WIDTH = 'width';
export const HEIGHT = 'height';
export const PADDING = 'padding';
export const BORDER = 'border';
export const MARGIN = 'margin';
export const CONFIG = 'config';
export const MOUNT = 'mount';
export const CANVAS_UPDATED = 'canvasUpdated';
export const CLASSPREFIX = 'classPrefix';
export const POLICIES = '_policies';
export const LEGEND = 'legend';
export const TITLE = 'title';
export const SUB_TITLE = 'subtitle';
export const RESOLVE = 'resolve';
export const DISCRETE = 'discrete';
export const STEP_COLOR = 'step-color';
export const GRADIENT = 'gradient';
export const LINEAR = 'linear';
export const ORDINAL = 'ordinal';
export const MUZE_PREFIX = 'muze';

export const TITLE_TEMPLATE_NOT_ALLOWED_TAGS = [
    'script',
    'style'
];

export const ICON_SHAPES = {
    SQUARE: 'square',
    CIRCLE: 'circle'
};

export const IS_POINT_MAP = {
    true: ICON_SHAPES.CIRCLE,
    false: ICON_SHAPES.SQUARE
};

export const LEGEND_TYPE_MAP = {
    [`${ORDINAL}-${true}-${COLOR}`]: DiscreteLegend,
    [`${ORDINAL}-${true}-${SIZE}`]: DiscreteLegend,
    [`${ORDINAL}-${true}-${SHAPE}`]: DiscreteLegend,
    [`${ORDINAL}-${false}-${COLOR}`]: DiscreteLegend,
    [`${ORDINAL}-${false}-${SHAPE}`]: DiscreteLegend,
    [`${ORDINAL}-${false}-${SIZE}`]: DiscreteLegend,
    [`${LINEAR}-${false}-${SIZE}`]: DiscreteLegend,
    [`${LINEAR}-${true}-${SIZE}`]: DiscreteLegend,
    [`${LINEAR}-${false}-${SHAPE}`]: DiscreteLegend,
    [`${LINEAR}-${true}-${COLOR}`]: StepLegend,
    [`${LINEAR}-${false}-${COLOR}`]: GradientLegend
};

export const LEFT = 'left';
export const RIGHT = 'right';
export const BOTTOM = 'bottom';
export const TOP = 'top';
export const GROUP = 'group';
export const LAYOUT = 'layout';
export const RETINAL = 'retinal';
export const DIMENSION = 'dimension';
export const MEASURE = 'measure';
export const VERTICAL = 'vertical';
export const HORIZONTAL = 'horizontal';
export const HORIZONTAL_CENTER = 'h-center';
export const VERTICAL_CENTER = 'v-center';
export const HIDDEN = 'hidden';
export const OVERFLOW = 'overflow';
export const OVERFLOW_X = 'overflow-x';
export const OVERFLOW_Y = 'overflow-y';
export const AUTO = 'auto';
export const VISIBLE = 'visible';
export const VERTICAL_SCROLL_BAR = 'verticalScrollBar';
export const HORIZONTAL_SCROLL_BAR = 'horizontalScrollBar';
export const GRID = 'grid';
export const POINT = 'point';
export const MESSAGE = 'message';
export const ERROR_MESSAGE = 'Insufficient data or incorrect configurations';
export const COMMON_INTERACTION = 'common';
export const INDIVIDUAL_INTERACTION = 'individual';
