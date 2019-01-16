// @warn Pseudo class of TextLayer to generate docs. Real text layer class attaches method to instance dynamically
// hence property jsdoc on all the method is not possible
export default class {
    /**
     * Sets the configuration of a layer.Configuration includes encoding and other configuration such as transform,
     * transition, className, etc.
     *
     * When used as setter,
     * @param {Object} config Layer configuration
     * @param {string} config.className Applies a class name to the dom elements.
     * @param {Object} config.transform Transform configuration.
     * @param {string} config.transform.type Type of transform.
     * Supported values are:-
     * 1. stack - Stacks text labels vertically or horizontally.
     * @param {string} config.transform.groupBy Dimensional field by which the lines will be stacked or grouped.
     * @param {Object} config.encoding Encoding configuration of the layer.
     * @param {string} config.encoding.x Field from which the x coordinate of each text is derived from.
     * @param {string} config.encoding.y Field from which the y coordinate of each text is derived from.
     * @param {Object|string} config.encoding.text Text encoding configuration or text field.
     * @param {string} config.encoding.text.field Field from which value of the text will be derived.
     * @param {Function} config.encoding.text.formatter Function which returns a formatted text.
     * @param {Object} config.encoding.color Color encoding configuration.
     * @param {Function} config.encoding.color.value Function which returns the color of each text.
     * @param {Object} config.transition Transition configuration
     * @param {boolean} config.transition.disabled If true, then disables the transition.
     * @param {Number} config.transition.duration Transition duration.
     * @param {Number} config.nearestPointThreshold If specified, then only those texts which are in the given
     * @return {TextLayer} Instance of text layer
     *
     * When used as getter,
     * @return {Object} Layer configuration.
     *
     * @public
     * @segment TextLayer
     */
    config () { }
}
