import { FieldType, DimensionSubtype } from 'muze-utils';
import { Measure, Categorical, DateTime, DiscreteMeasure } from './fields';

/**
 * Creates a field instance according to the provided data and schema.
 *
 * @todo Add logic for GEO dimension subtype.
 *
 * @param {Array} data - The field data array.
 * @param {Object} schema - The field schema object.
 * @return {Field} Returns the newly created field instance.
 */
function createUnitField (data, schema) {
    switch (schema.type) {
    case FieldType.MEASURE:
        switch (schema.subtype) {
        case 'discrete':
            return new DiscreteMeasure(schema.name, data, schema, schema.bins);
        default:
            return new Measure(schema.name, data, schema);
        }
    case FieldType.DIMENSION:
    default:
        switch (schema.subtype) {
        case DimensionSubtype.CATEGORICAL:
            return new Categorical(schema.name, data, schema);
        case DimensionSubtype.TEMPORAL:
            return new DateTime(schema.name, data, schema);
        case DimensionSubtype.GEO:
            return new Categorical(schema.name, data, schema);
        default:
            return new Categorical(schema.name, data, schema);
        }
    }
}

/**
 * Creates the field instances with input data and schema.
 *
 * @param {Array} dataColumn - The data array for fields.
 * @param {Array} schema - The schema array for fields.
 * @param {Array} headers - The array of header names.
 * @return {Array.<Field>} Returns an array of newly created field instances.
 */
function createFields (dataColumn, schema, headers) {
    const headersObj = {};

    if (!(headers && headers.length)) {
        headers = schema.map(item => item.name);
    }

    headers.forEach((header, i) => {
        headersObj[header] = i;
    });

    return schema.map(item => createUnitField(dataColumn[headersObj[item.name]], item));
}

export default createFields;
