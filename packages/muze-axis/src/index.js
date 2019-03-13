/**
 * @module Axis
 * This file exports all the public methods and classes in the axis module.
 */
import * as AxisOrientation from './enums/axis-orientation';
import * as ScaleType from './enums/scale-type';
import './styles.scss';

export { SimpleAxis, ContinousAxis, BandAxis, TimeAxis } from './cartesian-axis';
export { ColorAxis } from './color-axis';
export { SizeAxis } from './size-axis';
export { ShapeAxis } from './shape-axis';
export { RadiusAxis, AngleAxis } from './polar-axis';
export { dataTypeScaleMap } from './data-type-scale-map';
export { AxisOrientation, ScaleType };
