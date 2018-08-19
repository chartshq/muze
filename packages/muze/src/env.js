/**
 * Environment, like the name suggest, is similar to the concpet of closure in ECMAScript. Every time an canvas is
 * created from environment, it gets the configuration from environment. Configuraiton can be directly set on Canvas
 * also.
 *
 * @public
 * @module Env
 * @namespace Muze
 */

// @warn This is a pseudo class for generation of environment API. Environment is an logical concept which does not
// exists in pen and paper.
export default class Env {

    /**
     * Sets the data configuration property.
     * This is a getter-setter function.
     *
     * @public
     * @namespace Muze
     *
     * @param {DataModel} data Instance of datamodel to be visualized
     * @return {Env} Instance of the environment
     */
    data () { /* pseudo funciton */ }

    /**
     * Sets the width configuration property. Width in px is total horizontal space each canvas should take.
     * This is a getter-setter function.
     *
     * @public
     * @namespace Muze
     *
     * @param {Number} width Width of the visualization area
     * @return {Env} Instance of the environment
     */
    width () { /* pseudo funciton */ }

    /**
     * Sets the height configuration property. Height in px is total horizontal space each canvas should take.
     * This is a getter-setter function.
     *
     * @public
     * @namespace Muze
     *
     * @param {Number} width Height of the visualization area
     * @return {Env} Instance of the environment
     */
    height () { /* pseudo funciton */ }

    /**
     * Sets the configuration property for setting minimium unit width. *Unit* here is {@link VisualUnit} component of
     * Muze.
     *
     * This is a getter-setter function.
     *
     * @public
     * @namespace Muze
     *
     * @param {Number} [minWidth = 150] Min width of a {@link VisualUnit}
     * @return {Env} Instance of the environment
     */
    minUnitWidth () { /* pseudo funciton */ }

    /**
     * Sets the configuration property for setting minimium unit height. *Unit* here is {@link VisualUnit} component of
     * Muze.
     *
     * This is a getter-setter function.
     *
     * @public
     * @namespace Muze
     *
     * @param {Number} [minWidth = 150] Min height of a {@link VisualUnit}
     * @return {Env} Instance of the environment
     */
    minUnitHeight () { /* pseudo funciton */ }

    /**
     * Sets the configuration for canvases. User passed configuration is merged with default configuration and then
     * set to canvas
     *
     * This is a getter-setter function.
     *
     * @public
     * @namespace Muze
     *
     * @param {Config} config Partial or full configuration of canvas.
     * @return {Env} Instance of the environment
     */
    config () { /* pseudo funciton */ }

    /**
     *  Creates an instance of {@link Canvas} 
     *
     * @public
     * @namespace Muze
     *
     * @return {Canvas} Instance of canvas
     */
    canvas () { /* pseudo function */ }
}
