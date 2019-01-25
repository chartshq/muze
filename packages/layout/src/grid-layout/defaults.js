import * as FieldNames from '../enums/constants';

/**
 * Default configuration of the layout
 * @return {Object} returns the default configuration
 */
export const DEFAULT_CONFIGURATION = {
    [FieldNames.BORDER]: {
        [FieldNames.STYLE]: 'solid',
        [FieldNames.COLOR]: '#d6d6d6',
        [FieldNames.WIDTH]: 2,
        [FieldNames.COLLAPSE]: true,
        [FieldNames.SPACING]: 0
    },
    [FieldNames.PAGINATION]: 'scroll',
    [FieldNames.BUFFER]: 20,
    [FieldNames.GUTTERSPACE]: { rows: [], columns: [] },
    [FieldNames.DISTRIBUTION]: { rows: [], columns: [] },
    [FieldNames.BREAK_PAGE]: { rows: [], columns: [] },
    [FieldNames.ROW_SIZE_IS_EQUAL]: false,
    [FieldNames.COLUMN_SIZE_IS_EQUAL]: false,
    [FieldNames.COLUMN_POINTER]: 0,
    [FieldNames.ROW_POINTER]: 0
};

/**
 * Default measurements for the layout
 * @return {Object} returns the default measurements
 */
export const DEFAULT_MEASUREMENTS = {
    [FieldNames.GRID_WIDTH]: 100,
    [FieldNames.GRID_HEIGHT]: 100,
    [FieldNames.UNIT_WIDTH]: 100,
    [FieldNames.UNIT_HEIGHT]: 100
};

export const BLANK_BORDERS = 'rgba(0,0,0,0)';
