/**
 * @module Axis
 * This file declares a class that is used to render an axis to add  meaning to
 * plots.
 */
import { Symbols } from 'muze-utils';
import * as AxisOrientation from '../enums/axis-orientation';

/**
 * @module Axis
 * This file exports constants that are used to reference axis orientations
 * in a consistent manner.
 */
export const BOTTOM = 'bottom';
export const TOP = 'top';
export const LEFT = 'left';
export const RIGHT = 'right';

/**
  * This object is used to associate the axis orientation with the d3 class
  * used to represent that axis.
  */
export const axisOrientationMap = {
    [AxisOrientation.LEFT]: Symbols.axisLeft,
    [AxisOrientation.BOTTOM]: Symbols.axisBottom,
    [AxisOrientation.RIGHT]: Symbols.axisRight,
    [AxisOrientation.TOP]: Symbols.axisTop
};
