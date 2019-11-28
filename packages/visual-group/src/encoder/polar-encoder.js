import { AngleAxis, RadiusAxis } from '@chartshq/muze-axis';
import { layerFactory, ENCODING } from '@chartshq/visual-layer';
import {
    mergeRecursive,
    STATE_NAMESPACES,
    GROUP_BY_FUNCTIONS,
    COORD_TYPES,
    toArray,
    getObjProp,
    defaultValue
} from 'muze-utils';
import VisualEncoder from './visual-encoder';
import { SIZE, MEASURE, ARC, COLOR } from '../enums/constants';
import { sanitizeIndividualLayerConfig, resolveAxisConfig } from './encoder-helper';
import { SimpleVariable } from '../variable';

const POLAR = COORD_TYPES.POLAR;
const { RADIUS, ANGLE, ANGLE0 } = ENCODING;

const axesCls = {
    [RADIUS]: RadiusAxis,
    [ANGLE]: AngleAxis,
    [ANGLE0]: AngleAxis
};

const getSizeMultiplier = (sizeVal, sizeAxis) => {
    const sizeAxisDomain = sizeAxis.domain();
    const sizeMultiplier = sizeAxis.getSize(sizeVal) / (sizeAxisDomain ? sizeAxis.range()[1] : sizeAxis.config().value);
    return sizeMultiplier;
};

const setRadiusFactor = (context) => {
    const data = context.data();
    const sizeField = context.retinalFields().size.field;
    const { radius, size } = context.axes();

    if (sizeField && radius && radius.length) {
        const sizeFieldIndex = data.getFieldsConfig()[sizeField].index;
        const sizeVal = data.getData().data.reduce((acc, val) => acc + val[sizeFieldIndex], 1);
        const sizeMultiplier = getSizeMultiplier(sizeVal, size[0]);
        radius.forEach(axis => axis.setRadiusFactor(sizeMultiplier));
    }
};

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
     *
     * @memberof PolarEncoder
     */
    createAxis (axesCreators, fieldInfo, context) {
        const {
            axes
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

        const axesObj = {};
        const { geomCell, resolver } = context;
        const layers = resolver.matrixLayers();
        const resolverAxes = resolver.axes();
        const cellLayers = layers[rowIndex][columnIndex];
        const fields = {
            radius: {},
            angle: {},
            angle0: {}
        };

        cellLayers.forEach((layerConf) => {
            const def = layerConf.def;
            [ANGLE, ANGLE0, RADIUS].forEach((enc) => {
                const field = getObjProp(def.encoding, enc, 'field');
                field && (fields[enc][field] = 0);
            });
        });
        const fieldInf = {};
        const varInstances = {};

        for (const encType in fields) {
            fieldInf[encType] = Object.keys(fields[encType]);
            axesObj[encType] = [];
            varInstances[encType] = [];
            fieldInf[encType].forEach((field, i) => {
                varInstances[encType][i] = new SimpleVariable(field);
                axesObj[encType][i] = new axesCls[encType]();
            });
            axesObj[encType][axesObj[encType].length] = new axesCls[encType]();
        }
        resolveAxisConfig(context, fieldInf, {
            axesObj,
            rowIndex,
            columnIndex
        });
        geomCell.axes(axesObj)
            .fields(Object.assign({}, varInstances, geomCell.fields()));
        resolverAxes.pie = pieAxes;
        return geomCellAxes;
    }

    /**
     *
     *
     * @param {*} fields
     *
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

    unionUnitDomains (context) {
        const store = context.store();
        store.lockModel();
        const domainProps = {
            radius: [],
            angle: [],
            angle0: []
        };
        const axes = context.resolver().axes();
        context.matrixInstance().value.each((cell, rIdx, cIdx) => {
            const unit = cell.valueOf();
            const unitDomains = unit.dataDomain();
            const fields = unit.fields();
            setRadiusFactor(unit);
            [RADIUS, ANGLE, ANGLE0].forEach((encType) => {
                const encodingFields = fields[encType];
                const domains = unitDomains[encType] || {};
                encodingFields.forEach((field, i) => {
                    !domainProps[encType][rIdx] && (domainProps[encType][rIdx] = []);
                    !domainProps[encType][rIdx][cIdx] && (domainProps[encType][rIdx][cIdx] = []);
                    domainProps[encType][rIdx][cIdx][i] = domains[`${field}`] || [];
                });
            });
        });

        for (const key in domainProps) {
            const specificAxes = axes[key];
            specificAxes.forEach((axesArr, rIdx) => {
                axesArr.forEach((axisArr, cIdx) => {
                    axisArr.forEach((axis, i) => {
                        axis.domain(defaultValue(getObjProp(domainProps[key], rIdx, cIdx, i), []));

                        store.commit(`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.${key}`, domainProps[key],
                            `${rIdx}-${cIdx}`);
                    });
                });
            });
        }
        store.unlockModel();
    }

    /**
     *
     *
     *
     * @memberof PolarEncoder
     */
    setCommonDomain () {
        // No domain to be set
        return this;
    }

    /**
     *
     *
     *
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
        let sanitizedRows = [[], []];
        let sanitizedColumns = [[], []];
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
                }
            }));
        });
        sanitizedColumns = [...new Set(sanitizedColumns)];
        sanitizedRows = [...new Set(sanitizedRows)];
        this.fieldInfo({ rows: sanitizedRows, columns: sanitizedColumns });
        return this.fieldInfo();
    }

    getRetinalFieldsDomain (dataModels, encoding, facetFields, groupBy) {
        let sizeField;
        let colorField;
        const fields = [];
        const layers = this.layers();
        const dataModel = dataModels.groupedModel;
        const fieldsConfig = dataModel.getFieldsConfig();
        const domains = {};
        if (layers && layers[0]) {
            const layer = layers[0];
            const layerEncoding = layer.def.encoding || {};

            [RADIUS, ANGLE, SIZE, COLOR].forEach((encType) => {
                const field = layerEncoding[encType] ? layerEncoding[encType].field : '';
                const measureField = fieldsConfig[field] && fieldsConfig[field].def.type === MEASURE;
                if (encType === SIZE && measureField) {
                    sizeField = field;
                }
                if (encType === COLOR) {
                    colorField = field;
                }
                fieldsConfig[field] && !measureField && fields.push(field);
            });
        }

        if (sizeField) {
            domains[sizeField] = dataModel.groupBy(facetFields, {
                [sizeField]: GROUP_BY_FUNCTIONS.SUM
            }).getFieldspace().fieldsObj()[sizeField].domain();
        }

        if (colorField) {
            const dm = dataModel.groupBy([...facetFields, ...fields], groupBy.measures);
            domains[colorField] = dm.getFieldspace().fieldsObj()[colorField].domain();
        }
        return domains;
    }

    /**
     *
     *
     * @param {*} fields
     * @param {*} userLayerConfig
     *
     * @memberof PolarEncoder
     */
    getLayerConfig (fields, userLayerConfig, retinalConfig) {
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
        const sanitizedConfig = this.sanitizeLayerConfig(retinalConfig, layerConfig);
        this.layers(sanitizedConfig);
        return sanitizedConfig;
    }

    /**
     *
     *
     * @param {*} layerArray
     *
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

    sanitizeLayerConfig (encodingConfigs, userLayerConfig) {
        const layerConfig = [];

        userLayerConfig.forEach((config) => {
            const def = toArray(config.def);
            sanitizeIndividualLayerConfig(encodingConfigs, def);
            def.forEach((conf) => {
                const encoding = conf.encoding || (conf.encoding = {});
                !encoding.angle && (encoding.angle = {});
                const angleField = getObjProp(encoding.angle, 'field');
                const angle0Field = getObjProp(encoding.angle0, 'field');

                if (!angleField) {
                    Object.assign(encoding.angle, {
                        field: encodingConfigs.color && encodingConfigs.color.field
                    });
                }
                if (!angle0Field) {
                    !encoding.angle0 && (encoding.angle0 = {});
                    Object.assign(encoding.angle0, {
                        field: encoding.angle.field
                    });
                }
            });

            layerConfig.push(config);
        });
        return layerConfig;
    }

    hasMandatoryFields (fields) {
        const { optionalProjections } = fields;
        return super.hasMandatoryFields({ optionalProjections });
    }
}
