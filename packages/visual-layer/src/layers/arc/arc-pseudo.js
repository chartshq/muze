// @warn Pseudo class of Arc layer to generate docs. Real Tick layer class attaches method to instance dynamically
// hence property jsdoc on all the method is not possible
export default class {
    /**
     * Sets the configuration of a layer.Configuration includes encoding and other configuration such as transform,
     * transition, className, etc.
     *
     *
     * When used as setter,
     * @param {Object} config Layer configuration
     * @param {string} config.className Applies a class name to the dom elements.
     * @param {Object} config.encoding Encoding configuration of the layer.
     * @param {string} config.encoding.radius Field from which the radius of each arc will be derived from.
     * @param {string} config.encoding.angle Field from which the angle of each arc will be derived from.
     * @param {Object} config.encoding.color Color encoding configuration.
     * @param {Function} config.encoding.color.value Function which returns the color of each arc.
     * @param {number} config.encoding.startAngle Starting angle of the pie.
     * @param {number} config.encoding.endAngle Ending angle of the pie.
     * @param {number} config.encoding.cornerRadius Corner radius.
     * @param {number} config.encoding.padAngle padding angle between arcs.
     * @param {number} config.encoding.padRadius padding distance between arcs.
     * @param {string} config.encoding.sort Sorting order of arcs. Supported values: - ['asc', 'desc']
     * @param {Object} config.transition Transition configuration
     * @param {boolean} config.transition.disabled If true, then disables the transition.
     * @param {number} config.transition.duration Transition duration.
     *
     * @return {ArcLayer} Instance of arc layer
     *
     * When used as getter,
     * @return {Object} Layer configuration.
     *
     * @public
     * @segment ArcLayer
     */
    config () { }
}
