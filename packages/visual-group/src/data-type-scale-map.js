import { ScaleType } from '@chartshq/muze-axis';

/**
 * Map of DataModel types to associated field types.
 */
export const dataTypeScaleMap = {
    dimension: ScaleType.BAND,
    categorical: ScaleType.BAND,
    measure: ScaleType.LINEAR,
    temporal: ScaleType.TIME,
};

