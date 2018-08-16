import { layerFactory } from 'visual-layer';
import { mergeRecursive } from 'muze-utils';
import VisualEncoder from './visual-encoder';
import { RADIUS, ANGLE, SIZE, MEASURE, ARC, POLAR } from '../enums/constants';

/**
 *
 *
 * @export
 * @class PolarEncoder
 * @extends {VisualEncoder}
 */
export default class PolarEncoder extends VisualEncoder {

    /**
     *
     *
     * @param {*} axesCreators
     * @param {*} fieldInfo
     * @return
     * @memberof PolarEncoder
     */
    createAxis (axesCreators, fieldInfo) {
        const {
            axes,
        } = axesCreators;
        const geomCellAxes = axes;
        const {
            indices
        } = fieldInfo;
        const {
            rowIndex,
            columnIndex
        } = indices;
        // Dummy axes for polar, to create blank cells
        const pieAxes = geomCellAxes.pie || [];

        pieAxes[rowIndex] = pieAxes[rowIndex] || [];
        pieAxes[rowIndex][columnIndex] = [];

        geomCellAxes.pie = pieAxes;
        geomCellAxes.x = null;
        geomCellAxes.y = null;

        return geomCellAxes;
    }

    /**
     *
     *
     * @param {*} fields
     * @return
     * @memberof CartesianEncoder
     */
    getFacetsAndProjections (fields) {
        let counter = 0;
        const facets = [];
        const projections = [];
        const primaryFields = fields[0];
        const secondaryFields = fields[1];
        const primaryLen = primaryFields.length;
        const secondaryLen = secondaryFields.length;

        for (let i = 0; i < primaryLen; i++) {
            const primaryField = primaryFields[i];
            if (primaryField.type() === MEASURE) {
                const secondaryField = secondaryFields[counter++];
                const projArr = secondaryField ? [primaryField, secondaryField] : [primaryField];
                projections.push(projArr);
            } else {
                facets.push(primaryField);
            }
        }
        if (secondaryLen > counter) {
            for (let i = counter; i < secondaryLen; i++) {
                const secondaryField = secondaryFields[i];
                const projArr = [secondaryField];
                if (secondaryField.type() === MEASURE) {
                    projections.push(projArr);
                } else {
                    facets.push(secondaryField);
                }
            }
        }
        return {
            facets,
            projections
        };
    }

    /**
     *
     *
     * @return
     * @memberof PolarEncoder
     */
    setCommonDomain () {
        // No domain to be set
        return this;
    }

    /**
     *
     *
     * @return
     * @memberof PolarEncoder
     */
    static type () {
        return POLAR;
    }

    layers (...layers) {
        if (layers.length) {
            this._layers = layers[0];
            return this;
        }
        return this._layers;
    }

    /**
     *
     *
     * @param {*} datamodel
     * @param {*} config
     * @memberof PolarEncoder
     */
    fieldSanitizer (datamodel, config) {
        let sanitizedRows = [[], []],
            sanitizedColumns = [[], []];
        const fields = super.fieldSanitizer(datamodel, config);
        const {
            layers
        } = config;
        const {
            rows,
            columns
        } = fields;
        const layer = layers[0];
        const encoding = layer.encoding;
        const radius = encoding && encoding.radius ? encoding.radius.field : null;
        const angle = encoding && encoding.angle ? encoding.angle.field : null;
        const sanitizedFields = [sanitizedRows, sanitizedColumns];

        [rows, columns].forEach((fieldType, typeIndex) => {
            fieldType.forEach((fieldSet, i) => fieldSet.forEach((field) => {
                if (field.toString() !== radius && field.toString() !== angle && field.type() !== MEASURE) {
                    sanitizedFields[typeIndex][i].push(field);
                } }));
        });
        sanitizedColumns = [...new Set(sanitizedColumns)];
        sanitizedRows = [...new Set(sanitizedRows)];
        this.fieldInfo({ rows: sanitizedRows, columns: sanitizedColumns });
        return this.fieldInfo();
    }

    /**
     *
     *
     * @param {*} datamodel
     * @param {*} layerEncoding
     * @param {*} facetFields
     * @return
     * @memberof PolarEncoder
     */
    datamodelForEncoder (datamodel, config, facetFields) {
        const {
            color,
            size
        } = config;
        const fields = [];
        const layers = this.layers();

        color && color.field && fields.push(color.field);
        size && size.field && fields.push(size.field);

        if (layers && layers[0]) {
            const layer = layers[0];
            const encoding = layer.def.encoding || {};

            [RADIUS, ANGLE, SIZE].forEach((encType) => {
                encoding[encType] && fields.push(encoding[encType].field);
            });
        }
        return datamodel.groupBy([...facetFields, ...fields]);
    }

    /**
     *
     *
     * @param {*} fields
     * @param {*} userLayerConfig
     * @return
     * @memberof PolarEncoder
     */
    getLayerConfig (fields, userLayerConfig) {
        let layerConfig = [];
        const {
                columnFields,
                rowFields
            } = fields;
        const allFields = [...columnFields, ...rowFields];

        allFields.forEach(() => {
            const encoding = {};
            let config = {
                mark: ARC,
                def: {
                    encoding
                }
            };
            if (userLayerConfig && userLayerConfig.length > 0) {
                config = mergeRecursive(config, userLayerConfig[0]);
            }
            layerConfig.push(config);
        });
        if (layerConfig.length === 0) {
            layerConfig = userLayerConfig;
        }

        this.layers(layerConfig);
        return layerConfig;
    }

    /**
     *
     *
     * @param {*} layerArray
     * @returns
     * @memberof PolarEncoder
     */
    serializeLayerConfig (layerArray) {
        const serializedLayers = [];

        layerArray.length && layerArray.forEach((layer) => {
            const def = layerFactory.getSerializedConf(layer.mark, layer);
            serializedLayers.push({
                mark: layer.mark,
                def
            });
        });
        return serializedLayers;
    }
}
