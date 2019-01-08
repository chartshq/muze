/**
 * Configuration properties for tooltip.
 *
 * @public
 * @module TooltipFormatter
 *
 * @param {DataModel} dataModel data model instance containing all rows which needs to be shown in the tooltip.
 * @param {Object} context Additional information for formatting tooltip.
 * @param {Object} context.axes Instances of axis.
 * @param {ColorAxis} context.axes.color Color axis instance.
 * @param {SizeAxis} context.axes.size Size axis instance.
 * @param {ShapeAxis} context.axes.shape Shape Axis instance.
 *
 * @return {Array|Function} Array of arrays containing values to displayed in a row or function returned by
 * ```html``` operator available in {@link Operators}.
 * ```
 *  This method can return output in this format,
 *      [
 *          ['Origin', 'USA'],
 *          ['Cylinders', {
 *              value: '6',
 *              style: {
 *                  'font-weight': 'bold'
 *              }
 *          }]
 *      ]
 * Every sub array in the array represents a row in the tooltip content and each value can be as string or object.
 * Or it can be in this format,
 * html`<div>Origin</div><div>USA</div>`
 * ```
 */
