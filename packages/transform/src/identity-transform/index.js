/**
 * @module Transform
 * This file exports a function that is used to implement
 * the identity transform
 */
 /* eslint no-unused-vars: 0 */
 /**
  * This function accepts data and returns the data unchanged.
  * @param {Object} schema The schema.
  * @param {Array} data The data array.
  * @param {Object} config The config object.
  * @return {Array} The unchanged data.
  */
 function identityTransform (schema, data, config) {
     return data;
 }

 export default identityTransform;
