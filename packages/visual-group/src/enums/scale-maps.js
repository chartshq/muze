import { ContinousAxis, BandAxis, TimeAxis, ColorAxis, SizeAxis, ShapeAxis } from '@chartshq/muze-axis';

export const scaleMaps = {
    linear: ContinousAxis,
    band: BandAxis,
    temporal: TimeAxis,
    size: SizeAxis,
    color: ColorAxis,
    shape: ShapeAxis
};
