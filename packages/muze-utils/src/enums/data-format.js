/**
 * DataFormat Enum defines the format of the input data.
 * Based on the format of the data the respective adapter is loaded.
 *
 * @readonly
 * @enum {string}
 */
const DataFormat = {
    FLAT_JSON: 'FlatJSON',
    DSV_STR: 'DSVStr',
    DSV_ARR: 'DSVArr',
    AUTO: 'Auto'
};

export default DataFormat;
