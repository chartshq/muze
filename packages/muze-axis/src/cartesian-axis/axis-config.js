/**
 * Configuration properties for both x and y axis.
 *
 * @public
 * @module AxisConfig
 *
 * @param {string} name Name which will be displayed below or top of the x axis.
 * @param {string} interpolator Scale interpolator method. This decides the type of scale to be
 * created. Supported values: - [pow, log].
 * @param {number} numberOfTicks Sets the number of ticks.
 * Note:- This is just a hint. It may show more number of ticks than which is specified.
 * @param {number} nice Extends the domain so that it starts and ends on nice round values.
 * @param {boolean} show Whether to display the axis or not.
 * @param {boolean} showAxisName Whether to show the axis name or not.
 * @param {Function} tickFormat {@link tickFormat} function which returns formatted tick values.
 * @param {number} padding Controls padding between plots. Range is between 0 to 1.
 * @param {number} base Sets the base for log scale
 * @param {number} exponent Sets the exponent for pow scale.
 * @param {LinearAxisConfig} lAxis Sets LinearAxisConfig
 */
