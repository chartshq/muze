/**
 * Fracture transform regroups the data based on the number of measures present in the data. On a single dataset, if
 * this transform is applied, it breaks the original dataset to multiple dataset.
 * If the original data was in form of
 * |--------|----------|----------|
 * | ORIGIN | DOWNLOAD | WEBVISIT |
 * |--------|----------|----------|
 * Post this transformation the data breaks in to the following two form
 * |--------|----------|
 * | ORIGIN | DOWNLOAD |
 * |--------|----------|
 * and
 * |--------|----------|
 * | ORIGIN | WEBVISIT |
 * |--------|----------|
 *
 * @param {Array} schema which defines the data
 * @param {Array} data json data in column mode
 * @param {Object} config configuration based on which the break is performed. The members are
 *                 {
 *                      keys: ...,
 *                      breaks: ...
 *                  }
 *                  Keys are the one which will be present once the break is done. In the above example
 *                  ORIGIN is the key.
 *                  Breakes are the fields on which the breaks happen. No of breaks field is no of
 *                  child dataset created.
 *
 * @return {Array} transformed data and schema placed in an array
 */
// eslint-disable-next-line require-jsdoc
export default (schema, data, config) => {
    const
        {
            keys,
            breaks
        } = config,
        /*
         * This function creates an array by applying mask on a target array and reducing it. Lets say
         * you have an array target = [10, 20, 30, 40, 50, 60] and you have a mask [2, 4], which is essentially
         * an index arrays, then this function masks the target array and the aftermath of the ops is [false,
         * false, 3, false, 5, false] and then  reducing [3, 5].
         * The same logical implementation is done in the following funciton but from a different lens;
         * The mask array is iterated an for every element in the index the target array is randomly accessed.
         */
        maskAndReduce = target => mask => mask.map(i => target[i]),
        // Gets the index of the keys from schema. Once the index is retrieved, this same index will be
        // used to get the data from data array
        keyIndices = schema.map(field => keys.indexOf(field.name) !== -1)
            .reduce((acc, val, i) => (val ? acc.concat(i) : acc), []),
        // Similarly stores the index of the breaks.
        breakIndices = schema.map(entry => breaks.indexOf(entry.name) !== -1)
            .reduce((acc, val, i) => (val ? acc.concat(i) : acc), []),
        // Now every breaks field is appended with every copy of keys (as keys are always present)
        blueprint = breakIndices.map(i => keyIndices.slice(0).concat(i).sort()),
        // So far we have been dealing with indexes only. Now we will use those indexes to mask and get
        // the data we need
        transfomedData = blueprint.map(maskAndReduce(data)),
        transformedSchema = blueprint.map(maskAndReduce(schema));

    return [transformedSchema, transfomedData];
};
