import { MeasureSubtype, DimensionSubtype, FieldType } from 'muze-utils';

import { ScaleType } from '@chartshq/muze-axis';

/**
 * Map of DataModel types to associated field types.
 */
export const dataTypeScaleMap = {
    [FieldType.DIMENSION]: ScaleType.BAND,
    [DimensionSubtype.CATEGORICAL]: ScaleType.BAND,
    [DimensionSubtype.TEMPORAL]: ScaleType.TIME,
    [FieldType.MEASURE]: ScaleType.LINEAR,
    [MeasureSubtype.CONTINUOUS]: ScaleType.LINEAR,
    [DimensionSubtype.BINNED]: ScaleType.BAND
};
