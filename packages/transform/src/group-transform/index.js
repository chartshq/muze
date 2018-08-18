import { nestCollection } from '../utils';
/**
 * Create multiple datasets from a single dataset by grouping the data using
 * a dimensional field.
 * @param {Array} schema Name and type of fields are stored in schema
 * @param {Array} data Data array
 * @param {Object} config Configuration object
 * @return {Array} Grouped data array
 */
export default (schema, data, config) => {
    const groupBy = config.groupBy instanceof Array ? config.groupBy : [config.groupBy];
    const groupByIndices = groupBy.map(fieldName => schema.findIndex(d => d.name === fieldName));

    if (groupByIndices.find(d => d === -1) !== undefined) {
        throw new Error(`Groupby field ${groupBy} not found in schema`);
    }

    return nestCollection({
        keys: groupByIndices,
        data
    });
};
