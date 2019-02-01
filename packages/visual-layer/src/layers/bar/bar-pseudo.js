// @warn Pseudo class of BarLayer to generate docs. Real Bar layer class attaches method to instance dynamically
// hence property jsdoc on all the method is not possible
export default class {
    /**
     * Sets the configuration of a layer.Configuration includes encoding and other configuration such as transform,
     * transition, className, etc.
     *
     * When used as setter,
     * @param {Object} config Layer configuration
     * @param {string} config.className Applies a class name to the bar elements.
     * @param {Object} config.transform Transform configuration.
     * @param {string} config.transform.type Type of transform.
     * Supported values are:-
     * 1. stack - Stacks bars vertically or horizontally.
     * 2. group - Produces grouped bars.
     * @param {string} config.transform.groupBy Dimensional field by which the lines will be stacked or grouped.
     * @param {Object} config.encoding Encoding configuration of the layer.
     * @param {string} config.encoding.x Field from which the x coordinate of each bar is derived from.
     * @param {string} config.encoding.y Field from which the y coordinate of each bar is derived from.
     * @param {string} config.encoding.x0 If specified, produces horizontal range bars. In this case, the width of the
     * bar gets derived from x and x0 fields.
     * @param {string} config.encoding.y0 If specified, produces vertical range bars. In this case, the height of the
     * bar gets derived from y and y0 fields.
     * @param {Object} config.encoding.color Color configuration
     * @param {Function} config.encoding.color.value Function which returns the color each bar element.
     * @param {Object} config.transition Transition configuration
     * @param {boolean} config.transitionn.disabled If true, then disables the transition.
     * @param {Number} config.transition.duration Transition duration.
     * @return {BarLayer} Instance of bar layer
     *
     * When used as getter,
     * @return {Object} Layer configuration.
     * @public
     * @segment BarLayer
     */
    config () { }
}
