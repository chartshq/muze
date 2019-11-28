import { ERROR_MSG, mergeRecursive, generateGetterSetters } from 'muze-utils';
import { transformFields } from './field-sanitizer';
import { getHeaderAxisFrom, getFieldsFromSuppliedLayers, hasOneField } from '../group-helper/group-utils';
import { ROW, COLUMN } from '../enums/constants';
import { PROPS } from './props';

/**
 *
 *
 * @export
 * @class VisualEncoder
 */
export default class VisualEncoder {

    constructor () {
        generateGetterSetters(this, PROPS);
    }

    /**
     *
     *
     * @memberof VisualEncoder
     */
    createAxis () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     *
     *
     * @memberof VisualEncoder
     */
    setCommonDomain () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    /**
     *
     *
     * @memberof VisualEncoder
     */
    getLayerConfig () {
        throw new Error(ERROR_MSG.INTERFACE_IMPL);
    }

    fieldInfo (...info) {
        if (info.length) {
            this._fieldInfo = mergeRecursive(this._fieldInfo || {}, info[0]);
            return this;
        }
        return this._fieldInfo;
    }

    /**
     *
     *
     * @param {*} datamodel
     * @param {*} config
     *
     * @memberof VisualEncoder
     */
    fieldSanitizer (datamodel, config) {
        this.fieldInfo(transformFields(datamodel, config));
        return this.fieldInfo();
    }

    /**
     *
     *
     * @param {*} params
     *
     * @memberof VisualEncoder
     */
    axisFrom (...params) {
        if (params.length) {
            this._axisFrom = params[0];
            return this;
        }
        return this._axisFrom;
    }

    /**
     *
     *
     * @param {*} params
     *
     * @memberof VisualEncoder
     */
    headerFrom (...params) {
        if (params.length) {
            this._headerFrom = params[0];
            return this;
        }
        return this.__headerFrom;
    }

    /**
     *
     *
     * @param {*} axisFrom
     *
     * @memberof CartesianEncoder
     */
    setAxisAndHeaders (axisFrom = {}, fields) {
        const [rowHeader, rowAxis] = getHeaderAxisFrom(ROW, fields.rows, axisFrom);
        const [colHeader, colAxis] = getHeaderAxisFrom(COLUMN, fields.columns, axisFrom);

        this.axisFrom({
            row: rowAxis,
            column: colAxis
        });
        this.headerFrom({
            row: rowHeader,
            column: colHeader
        });
        return this;
    }

    getProjectionFields (layers) {
        return getFieldsFromSuppliedLayers(layers);
    }

    hasMandatoryFields (fields) {
        return hasOneField(fields);
    }
}
