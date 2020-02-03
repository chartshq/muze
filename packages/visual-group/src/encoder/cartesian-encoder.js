import { layerFactory } from '@chartshq/visual-layer';
import {
    mergeRecursive,
    STATE_NAMESPACES,
    unionDomain,
    COORD_TYPES,
    toArray,
    sortCategoricalField
} from 'muze-utils';
import { ScaleType } from '@chartshq/muze-axis';
import {
    generateAxisFromMap,
    getDefaultMark,
    getIndex,
    getLayerConfFromFields,
    getAdjustedDomain,
    sanitizeIndividualLayerConfig,
    getSortingConfig
} from './encoder-helper';
import { retriveDomainFromData } from '../group-helper';

import { ROW, COLUMN, COL, LEFT, TOP, MEASURE, BOTH, X, Y, TEMPORAL } from '../enums/constants';
import VisualEncoder from './visual-encoder';

const CARTESIAN = COORD_TYPES.CARTESIAN;

/**
 *
 *
 * @export
 * @class CartesianEncoder
 * @extends {VisualEncoder}
 */
export default class CartesianEncoder extends VisualEncoder {

    /**
     *
     *
     *
     * @memberof CartesianEncoder
     */
    static type () {
        return CARTESIAN;
    }

    /**
     *
     *
     * @param {*} axesCreators
     * @param {*} fieldInfo
     *
     * @memberof CartesianEncoder
     */
    createAxis (axesCreators, fieldInfo, context) {
        const geomCellAxes = {};
        const {
            axes
        } = axesCreators;
        const {
            projections,
            indices
        } = fieldInfo;
        const {
            rowFields,
            columnFields
        } = projections;
        const {
             rowIndex,
             columnIndex
        } = indices;
        const axisFields = [{
            fields: rowFields,
            index: rowIndex
        }, {
            fields: columnFields,
            index: columnIndex
        }];
        const { resolver, facetFields, geomCell } = context;
        const xAxes = axes.x || [];
        const yAxes = axes.y || [];

        [rowFields, columnFields].forEach((fields, i) => {
            const type = i === 0 ? ROW : COLUMN;
            const axis = i === 0 ? Y : X;

            if (fields.length > 1) {
                axesCreators.position = BOTH;
            } else {
                axesCreators.position = this.axisFrom()[type];
            }
            geomCellAxes[axis] = generateAxisFromMap(axis, axisFields[i], axesCreators, {
                groupAxes: axis === X ? xAxes : yAxes,
                valueParser: resolver.valueParser()
            }, indices, facetFields);
        });
        geomCell.axes(geomCellAxes);
        return geomCellAxes;
    }

    unionUnitDomains (context) {
        const store = context.store();
        const resolver = context.resolver();
        const units = resolver.units();
        const domains = {
            0: {},
            1: {}
        };
        const fieldsObj = {
            0: {},
            1: {}
        };

        for (let rIdx = 0, len = units.length; rIdx < len; rIdx++) {
            const unitsArr = units[rIdx];
            for (let cIdx = 0, len2 = unitsArr.length; cIdx < len2; cIdx++) {
                const unit = unitsArr[cIdx];
                const axisFields = unit.fields();
                const encodingDomains = unit.dataDomain();
                ['x', 'y'].forEach((axisType, axisTypeIndex) => {
                    const fieldArr = axisFields[axisType];
                    fieldArr.forEach((field, axisIndex) => {
                        const key = !axisTypeIndex ? `0${cIdx}${axisIndex}` : `${rIdx}0${axisIndex}`;
                        const dom = encodingDomains[axisType];
                        const typeOfField = field.subtype();
                        fieldsObj[axisTypeIndex][key] = field;

                        if (dom && Object.keys(dom).length !== 0) {
                            domains[axisTypeIndex][key] = unionDomain([(domains[axisTypeIndex] &&
                                domains[axisTypeIndex][key]) || [], dom[`${field}`]], typeOfField);
                        }
                    });
                });
            }
        }

        const { x: xAxes, y: yAxes } = resolver.axes();
        store.lockModel();
        [xAxes, yAxes].forEach((axesArr, axisType) => {
            axesArr.forEach((axes, idx) => {
                let key;
                let domain = [];
                let adjustedDomain = [];
                const min = [];
                const max = [];
                const typeOfAxis = axes[0].constructor.type();

                if (axes.length > 1 && typeOfAxis === ScaleType.LINEAR && axes[0].config().alignZeroLine) {
                    axes.forEach((axis, i) => {
                        key = !axisType ? `0${idx}${i}` : `${idx}0${i}`;
                        domain = domains[axisType][key];
                        min[i] = domain[0];
                        max[i] = domain[1];
                    });
                    adjustedDomain = getAdjustedDomain(max, min);
                } else if (typeOfAxis === ScaleType.BAND) {
                    /* Sort categorical fields to ensure consistency across all rows
                    only if sorted by user */
                    key = !axisType ? `0${idx}0` : `${idx}00`;
                    const currentFieldName = fieldsObj[axisType][key].oneVar();
                    const sortingOrder = getSortingConfig(context, currentFieldName, axes[0].config);
                    if (sortingOrder && domains[axisType][key] instanceof Array) {
                        domains[axisType][key].sort((a, b) => sortCategoricalField(sortingOrder, a, b));
                    }
                }

                axes.forEach((axis, index) => {
                    key = !axisType ? `0${idx}${index}` : `${idx}0${index}`;
                    domain = adjustedDomain[index] || domains[axisType][key];

                    domain && axis.domain(domain);
                    const type = !axisType ? 'x' : 'y';
                    store.commit(`${STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE}.domain.${type}`, domain, `${idx}${index}`);
                });
            });
        });
        store.unlockModel();
    }

    /**
     *
     *
     * @param {*} fields
     *
     * @memberof CartesianEncoder
     */
    getFacetsAndProjections (fields, type) {
        let facets = [];
        let projections = [];
        let counter = 0;
        const primaryFacets = [];
        const secondaryFacets = [];
        const primaryFields = fields[0];
        const secondaryFields = fields[1];
        const primaryLen = primaryFields.length;
        const secondaryLen = secondaryFields.length;
        const axisFrom = this.axisFrom();

        for (let i = 0; i < primaryLen; i++) {
            let projArr = [primaryFields[i]];
            const primaryField = primaryFields[i];

            if (primaryField.type() === MEASURE) {
                const secondaryField = secondaryFields[counter];
                if (secondaryField && secondaryField.type() === MEASURE) {
                    counter++;
                    projArr = [primaryField, secondaryField];
                }
                projections.push(projArr);
            } else {
                facets.push(primaryField);
                primaryFacets.push(primaryField);
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
                    secondaryFacets.push(secondaryField);
                }
            }
        }
        if ((primaryFacets.length || secondaryFacets.length) && !projections.length) {
            type = type === COL ? COLUMN : type;
            if ((axisFrom[type] === LEFT || axisFrom[type] === TOP) && primaryFacets.length) {
                const axisFromIndex = primaryFacets.length - 1;
                const facet = primaryFacets[axisFromIndex];
                projections = [[facet]];
                const existIndex = getIndex(secondaryFacets, facet);
                if (existIndex > -1) {
                    projections = [[facet, facet]];
                    secondaryFacets.splice(existIndex, 1);
                }
                primaryFacets.splice(axisFromIndex, 1);
            } else {
                const axisFromIndex = 0;
                const facet = secondaryFacets[axisFromIndex];
                projections = [[facet]];
                const existIndex = getIndex(primaryFacets, facet);
                if (existIndex > -1) {
                    projections = [[facet, facet]];
                    primaryFacets.splice(existIndex, 1);
                }
                secondaryFacets.splice(axisFromIndex, 1);
            }
        }

        facets = [...primaryFacets, ...secondaryFacets];
        facets = facets.filter((el, index, self) => index === self.findIndex(t => (t.toString() === el.toString())));
        return {
            facets,
            projections
        };
    }

    /**
     *
     *
     * @param {*} datamodel
     * @param {*} config
     *
     * @memberof CartesianEncoder
     */
    fieldSanitizer (datamodel, config) {
        return super.fieldSanitizer(datamodel, config);
    }

    /**
     *
     *
     * @param {*} datamodel
     *
     * @memberof CartesianEncoder
     */
    getRetinalFieldsDomain (dataModels, encoding) {
        const groupedModel = dataModels.groupedModel;
        const domains = {};
        for (const key in encoding) {
            if ({}.hasOwnProperty.call(encoding, key)) {
                const encodingObj = encoding[key];
                const field = encodingObj.field;
                if (!encodingObj.domain && field) {
                    let domain = retriveDomainFromData(groupedModel, field);
                    const fieldInstance = groupedModel.getFieldspace().fieldsObj()[field];
                    const isTemporalField = fieldInstance.schema().subtype === TEMPORAL;

                    if (isTemporalField) {
                        domain = fieldInstance.data();
                    }

                    domains[field] = domain;
                }
            }
        }
        return domains;
    }

    /**
     *
     *
     * @param {*} layerArray
     * @memberof CartesianEncoder
     */
    serializeLayerConfig (layerArray) {
        const serializedLayers = [];
        // let currentLayerIndex = 0;
        layerArray.length && layerArray.forEach((layer, i) => {
            const def = layerFactory.sanitizeLayerConfig(layer);
            def.order = i;
            serializedLayers.push(def);
        });
        return serializedLayers;
    }

    sanitizeLayerConfig (encodingConfigs, userLayerConfig) {
        const layerConfig = [];
        userLayerConfig.forEach((config) => {
            const def = toArray(config.def);
            sanitizeIndividualLayerConfig(encodingConfigs, def);
            layerConfig.push(config);
        });
        return layerConfig;
    }

    /**
     *
     *
     * @param {*} fields
     * @param {*} userLayerConfig
     *
     * @memberof CartesianEncoder
     */
    getLayerConfig (fields, userLayerConfig, retinalConfig) {
        const layerConfig = [];
        const {
            columnFields,
            rowFields
        } = fields;

        // let currentLayerIndex = 0;
        columnFields.forEach((colField) => {
            const colFieldName = colField.toString();
            rowFields.forEach((rowField) => {
                let configs = [];
                const rowFieldName = rowField.toString();
                const encoding = {
                    x: {
                        field: colFieldName
                    },
                    y: {
                        field: rowFieldName
                    }
                };
                const rowFieldType = rowField.subtype();
                const colFieldType = colField.subtype();
                const mark = getDefaultMark(colFieldType, rowFieldType);

                const defConfigs = [{
                    mark,
                    def: {
                        mark,
                        encoding
                    }
                }];

                const layerConfigs = getLayerConfFromFields(colField.getMembers(),
                    rowField.getMembers(), userLayerConfig || []);
                if (layerConfigs.length) {
                    configs = layerConfigs.map((layerConf) => {
                        const mergedLayerConf = mergeRecursive(mergeRecursive({}, defConfigs[0].def), layerConf);
                        const serializedLayerConfig = layerFactory.getSerializedConf(mergedLayerConf.mark,
                            mergedLayerConf);
                        return {
                            mark: mergedLayerConf.mark,
                            order: mergedLayerConf.order,
                            def: serializedLayerConfig
                        };
                    });
                } else {
                    configs = defConfigs;
                }

                layerConfig.push(...configs);
            });
        });
        return this.sanitizeLayerConfig(retinalConfig, layerConfig);
    }

    hasMandatoryFields (fields) {
        const { colProjections, rowProjections } = fields;
        const colFields = super.hasMandatoryFields({ colProjections });
        const rowFields = super.hasMandatoryFields({ rowProjections });
        return colFields && rowFields;
    }
}
