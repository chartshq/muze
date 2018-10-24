/**
 * Environment, like the name suggest, is similar to the concpet of closure in ECMAScript. Every time a canvas is
 * created from environment, it gets the configuration from environment itself. Configuraiton can be directly set on
 * Canvas also.
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
     *
     * @param {Object} config Partial or full configuration of canvas.
     * @param {Object} config.axes Axis configuration.
     * @param {Object} config.axes.x X Axis configuration.
     * @param {string} config.axes.x.name Name which will be displayed below or top of the x axis.
     * @param {string} config.axes.x.interpolator Scale interpolator method. This decides the type of scale to be
     * created. Supported values: - [pow, log].
     * @param {number} config.axes.x.numberOfTicks Sets the number of ticks.
     * Note:- This is just a hint. It may show more number of ticks than which is specified.
     * @param {number} config.axes.x.nice Extends the domain so that it starts and ends on nice round values.
     * @param {boolean} config.axes.x.show Whether to display the axis or not.
     * @param {boolean} config.axes.x.showAxisName Whether to show the axis name or not.
     * @param {Function} config.axes.x.tickFormat Function which returns formatted tick values.
     *
     * @return {Env} Instance of the environment
     */
    config () { /* pseudo function */ }

    /**
     *  Creates an instance of {@link Canvas}
     *
     * @public
     *
     * @return {Canvas} Instance of canvas
     */
    canvas () { /* pseudo function */ }

    /**
     * Components of Muze are loaded from registry. User can override the default component by overriding the registry
     * with new component definition.
     *
     * Muze creates multiple cells to house the visualization components. Those are called {@link Cells}.
     * `cellRegistry` is the registry for those cells.
     * - {@link SimpleCell}
     * - {@link TextCell}
     * - {@link AxisCell}
     * - {@link GeomCell}
     * - {@link BlankCell}
     *
     * This funciton acts as getter and setter.
     * When acts as a getter this returns the list of registries you can extend.
     * When acts as a setter this allows user to register a component for a existing key. During the process of setting
     * a new component in registry, it is not allowed to create a new key.
     *
     * ```
     *  const GeomCell = env.cellRegistry().GeomCell;
     *  env.cellRegistry({
     *      GeomCell: class NewGeomCell extends GeomCell {
     *          render () {
     *              // override the render
     *          }
     *      }
     * });
     * ```
     * @public
     *
     * When called as a setter
     * @param {Object} override Key value pair where keys are the name of the cells user with to override. Allowed keys
     *      are
     *      - `SimpleCell`
     *      - `TextCell`
     *      - `AxisCell`
     *      - `GeomCell`
     *      - `BlankCell`
     *      And value being the overridden class definition.
     *
     * @return {Env} Instance of current environment
     *
     * When called as a getter
     * @return {object} Object containing the registration key and class definition
     *      ```
     *          {
     *              SimpleCell: SimpleCell,
     *              TextCell: TextCell,
     *              AxisCell: AxisCell,
     *              GeomCell: GeomCell,
     *              BlankCell: BlankCell
     *          }
     *      ```
     */
    cellRegistry () { /* pseudo function */ }

    /**
     * Components of Muze are loaded from registry. User can override the default component by overriding the registry
     * with new component definition.
     *
     * Muze composes layers to create a visualization. Each layer contain one mark (plot) type. Superposition of
     * one or multiple such layers create one visulization. Muze provides definition of atomic layers. A new layer can
     * be created and used as a mark type. `layerRegistry` handles the registrtion process. Atomic layers are
     *      - {@link AreaLayer}
     *      - {@link ArcLayer}
     *      - {@link LineLayer}
     *      - {@link TextLayer}
     *      - {@link PointLayer}
     *      - {@link TickLayer}
     *      - {@link BarLayer}
     *      - {@link BaseLayer}
     *
     * For `layerRegistry` a new layer can be registered by using a new key.
     *
     * ```
     *  const PointLayer = env.layerRegistry().point;
     *  env.layerRegistry({
     *      grass: class GrassLayer extends PointLayer {
     *          render () {
     *              // renders layer here
     *          }
     *      }
     *  });
     * ```
     * Access the new layer type by mentioning it as a mark type
     * ```
     *  .layers([{
     *      mark: 'bar',
     *      encoding: {
     *          y: 'Acceleration'
     *      }
     *  }, {
     *      mark: 'grass', // new mark type
     *      encoding: {
     *          y: 'Displacement'
     *      }
     *  }])
     * ```
     *
     * @public
     *
     * When called as a setter
     * @param {Object} override Key value pair where keys are the name of the cells user with to override. Allowed keys
     *      are
     *      - `Area`
     *      - `Arc`
     *      - `Line`
     *      - `Text`
     *      - `Point`
     *      - `Tick`
     *      - `Bar`
     *      And value being the overridden class definition.
     *
     * @return {Env} Instance of current environment
     *
     * When called as a getter
     * @return {object} Object containing the registration key and class definition
     *      ```
     *          {
     *              Area: AreaLayer,
     *              Text: TextLayer,
     *              Arc: ArcLayer,
     *              Line: LineLayer,
     *              Bar: BarLayer,
     *              Line: LineLayer,
     *              Point: PointLayer,
     *              Tick: TickLayer
     *          }
     *      ```
     */
    layerRegistry () { /* pseudo function */ }
}
