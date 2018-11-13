 // @warn Pseudo class of VisualUnit to generate docs. Real Visual Unit attaches method to instance dynamically
 // hence property jsdoc on all the mthod is not possible
 export default class {
    /**
     * Updates the visual unit with new data model. This also internally updates the datamodel of all the layers and
     * rerenders them.
     *
     * @public
     * @segment VisualUnit
     *
     * @param {DataModel} data Instance of new data model.
     *
     * @return {VisualUnit} Instance of visual unit.
    */
     data () { }

    /**
     * Returns the facet field names and their values associated with this visual unit.
     *
     * @public
     * @segment VisualUnit
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
     * @segment VisualUnit
     * @return {Array} Color, shape and size fields.
     */
     retinalFields () { }

    /**
     * Returns the alias of the visual group which houses this visual unit.
     *
     * @public
     * @segment VisualUnit
     * @return {string} Alias of the parent visual group.
     */
     parentAlias () { }

    /**
     * Returns the instances of the layers which is created by the visual unit.
     *
     * @public
     * @segment VisualUnit
     * @return {Array} Array of layer instances.
     */
     layers () { }

    /**
     * Returns the axis instances attached to this visual unit.
     *
     * @public
     * @segment VisualUnit
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
     * @segment VisualUnit
     * @return {Object} X and Y Axis fields.
     * ```
     *      {
     *          x: [{@link SimpleVariable}/{@link ComposedVar}, {@link SimpleVariable}/{@link ComposedVar}],
     *          y: [{@link SimpleVariable}/{@link ComposedVar},{@link SimpleVariable}/{@link ComposedVar}]
     *      }
     * ```
     */
     fields () { }
}
