import AxisCell from './axis-cell';
import BlankCell from './blank-cell';
import TextCell from './text-cell';
import GeomCell from './geom-cell';
import SimpleCell from './simple-cell';

import * as CONSTANTS from './constants';

export const DEFAULT_PLACEHOLDERS = {
    [CONSTANTS.SIMPLE_CELL]: SimpleCell,
    [CONSTANTS.TEXT_CELL]: TextCell,
    [CONSTANTS.AXIS_CELL]: AxisCell,
    [CONSTANTS.GEOM_CELL]: GeomCell,
    [CONSTANTS.BLANK_CELL]: BlankCell
};
