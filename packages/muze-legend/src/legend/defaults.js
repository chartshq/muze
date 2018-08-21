import { getSymbol } from 'muze-utils';

export const ALIGN = {
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
};

export const DEFAULT_MEASUREMENT = {
    height: 30,
    width: 30,
    maxWidth: Infinity,
    maxHeight: Infinity,
    padding: 3,
    margin: 2,
    border: 1
};

export const DEFAULT_CONFIG = {
    classPrefix: 'muze',
    formatter: {
        bounds: {
            lower: 'less than',
            upper: 'more than'
        }
    },
    item: {
        text: {
            position: 'right',
            width: 10
        },
        shape: {
            height: 20,
            width: 20,
            color: 'rgba(0,0,0,.5)',
            type: 'square'
        }
    }
};

/**
 * Creates a map of pre defined shapes
 *
 * @param {string} shape Accepts a shape name like 'square', 'cross', 'diamond' etc
 * @return {Object} shape object which can be used to draw the shapes
 */
export const SHAPE_MAP = shape => shape && getSymbol(shape);
