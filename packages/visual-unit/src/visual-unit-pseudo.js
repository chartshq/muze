/**
 * Visual Unit is hierarchical component created by {@link VisualGroup}. This component accepts layer definitions
 * and creates concrete layer instances from them, binds data and attaches axis to them. It also retreives the domain
 * from the layers and unions them and sets them on corresponding axis instances. This also creates the parent svg
 * groups for all the layers and delegates the rendering to all the layers.
 *
 *
 * @class VisualUnit
 * @public
 * @namespace muze
 */
 // @warn Pseudo class of VisualUnit to generate docs. Real Visual Unit attaches method to instance dynamically
 // hence property jsdoc on all the mthod is not possible
export default class {

    /**
     * Returns the facet field names and their values associated with this visual unit.
     *
     * @public
     * @return {Array} Facet field information.
     *  ```
     *     [
     *      ['Cylinders', 'Origin'], // First array defines the name of the facet fields.
     *      ['8', 'USA'] // Second array defines the values of the corresponding facet fields.
     *     ]
     * ```
     */
    facetByFields () { }

    /**
     * Returns the retinal fields like color, shape and size field associated with this visual unit.
     *
     * @public
     * @return {Array} Color, shape and size fields.
     */
    retinalFields () { }

    /**
     * Returns the alias of the visual group which houses this visual unit.
     *
     * @public
     * @return {string} Alias of the parent visual group.
     */
    parentAlias () { }

    /**
     * Returns the instances of the layers which is created by the visual unit.
     *
     * @public
     * @return {Array} Array of layer instances.
     */
    layers () { }

    /**
     * Returns an array of detail fields associated with this visual unit.
     *
     * @public
     * @return {Array} Array of detail fields.
     */
    detailFields () { }

    /**
     * Updates the visual unit with new data model. This also internally updates the datamodel of all the layers and
     * rerenders them.
     *
     * @public
     * @param {DataModel} data Instance of new data model.
     *
     * @return {VisualUnit} Instance of visual unit.
     */
    data () { }

    /**
     * Caches all the datamodels in an array from the next `data()` call on visual unit until `clearCaching()` or
     * `resetData()` is called on it.
     *
     * @public
     * @return {VisualUnit} Instance of visual unit.
     */
    enableCaching () { }

    /**
     * Clears all the previous cached data.
     *
     * @public
     * @return {VisualUnit} Instance of visual unit.
     */
    clearCaching () { }

    /**
     * Resets the data of visual unit to original data model. It also clears the cached data.
     *
     * @public
     * @return {VisualUnit} Instance of visual unit.
     */
    resetData () { }

    /**
     * Returns the unique id of this visual unit.
     *
     * @public
     * @return {string} Unique identifier.
     */
    id () { }

    /**
     * Adds a new layer to the visual unit. It takes a layer definition and creates layer instances from them. It does
     * not render the layers. It returns the layer instances in an array. If the layer definition is a composite layer,
     * then multiple layer instances will be returned in the array.
     *
     * To add a layer in the unit,
     * ```
     *      unit.addLayer({
     *          name: 'bullet',
     *          mark: 'bar',
     *          encoding: {
     *              x: 'Year',
     *              y: 'Acceleration',
     *              color: 'Origin'
     *          }
     *      });
     * ```
     * @public
     * @param {Object} layerDef Definition of new layer.
     *
     * @return {Array} Array of layer instances.
     */
    addLayer () { }

    /**
     * Returns an array of layer instances which matches the supplied mark type.
     *
     * @public
     * @param {string} type Mark type of layer.
     *
     * @return {Array} Array of layer instances.
     */
    getLayersByType () { }

    /**
     * Returns the layer instance which matches the supplied layer name. If no layer is found, then it returns
     * undefined.
     *
     * @public
     * @param {string} name Name of layer.
     *
     * @return {BaseLayer} Layer instance.
     */
    getLayerByName () { }

    /**
     * Removes all the layer instances which matches the supplied mark type.
     *
     * @public
     * @param {string} type Mark type of layer.
     *
     * @return {VisualUnit} Instance of visual unit.
     */
    removeLayersByType () { }

    /**
     * Removes the layer instance which matches the supplied layer name.
     *
     * @public
     * @param {string} name Name of layer
     *
     * @return {VisualUnit} Instance of visual unit.
     */
    removeLayerByName () { }

    /**
     * Returns the axis instances attached to this visual unit.
     *
     * @return {Object} Axis instances.
     * ```
     *     {
     *         x: [PrimaryAxis, SecondaryAxis], // First element in array is primary x axis and the second element
     *      is the secondary x axis.
     *         y: [PrimaryAxis, SecondaryAxis], // First element in array is primary y axis and the second element
     *      is the secondary y axis.
     *         color: [ColorAxis],
     *         shape: [ShapeAxis],
     *         size: [SizeAxis]
     *     }
     * ```
     */
    axes () { }

    /**
     * Returns the axis fields of the visual unit. It returns the variable instances of the primary and secondary axis
     * fields attached with the visual unit.
     *
     * @public
     *
     * @return {Object} X and Y Axis fields.
     * ```
     *      {
     *          x: [{@link SimpleVariable}/{@link ComposedVar}, {@link SimpleVariable}/{@link ComposedVar}],
     *          y: [{@link SimpleVariable}/{@link ComposedVar},{@link SimpleVariable}/{@link ComposedVar}]
     *      }
     * ```
     */
    fields () { }

    /**
     * Returns the point located nearest to the supplied x and y position. It returns the unique identifiers of the
     * point. This function also accepts an additional configuration `getAllPoints` inside `config` object in the third
     * argument which if set to true, then it returns the identifiers of all the points which falls on the nearest
     * x value or y value if any one of the field is a dimension. Additionally, a target property is also returned
     * which contains the identifier of the nearest point. If no nearest point is found, then it returns identifier
     * as null.
     *
     * @public
     *
     * @param {number} x X Position of the point from where nearest point is to be found.
     * @param {number} y Y Position of the point from where nearest point is to be found.
     * @param {Object} config Additional configuration options.
     * @param {boolean} config.getAllPoints If true, then returns all the points nearest to the x value or y value if
     * it is dimension.
     * @param {Object} config.data Data associated with the nearest point.
     * @return {Object} Nearest point information
     * ```
     *      {
     *          id: [['Origin'], ['USA'], ['Japan']], // Identifiers of all the points closest to the x value.
     *          target: [['Origin'], ['Japan']] // Identifier of the nearest point.
     *      }
     * ```
     */
    getNearestPoint () { }

    /**
     * Get the information of all the marks like x, y position and size of each marks from supplied identifiers. It
     * returns an array of points whose data matches the given identifiers.
     *
     * @public
     *
     * @param {Array}
     */
    getPlotPointFromIdentifiers () { }
}
