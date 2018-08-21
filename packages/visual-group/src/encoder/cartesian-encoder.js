import { layerFactory } from '@chartshq/visual-layer';
import { mergeRecursive } from 'muze-utils';
import { generateAxisFromMap, getDefaultMark, getIndex, getLayerConfFromFields } from './encoder-helper';
import { retriveDomainFromData } from '../group-helper';

import { ROW, COLUMN, COL, LEFT, TOP, CARTESIAN, MEASURE, BOTH, X, Y } from '../enums/constants';
import VisualEncoder from './visual-encoder';

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
     * @return
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
     * @return
     * @memberof CartesianEncoder
     */
    createAxis (axesCreators, fieldInfo) {
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
            geomCellAxes[axis] = generateAxisFromMap(axis, axisFields[i], axesCreators, axis === X ? xAxes : yAxes);
        });
        return geomCellAxes;
    }

    /**
     *
     *
     * @param {*} fields
     * @return
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
     * @return
     * @memberof CartesianEncoder
     */
    fieldSanitizer (datamodel, config) {
        return super.fieldSanitizer(datamodel, config);
    }

    /**
     *
     *
     * @param {*} datamodel
     * @return
     * @memberof CartesianEncoder
     */
    getRetinalFieldsDomain (dataModels, encoding) {
        const groupedModel = dataModels.groupedModel;
        const domains = {};
        Object.entries(encoding).forEach((enc) => {
            if (enc[1] && enc[1].field) {
                const field = enc[1].field;
                if (field && (!field[1] || (field[1] && !field[1].domain))) {
                    const domain = retriveDomainFromData(groupedModel, field);
                    domains[field] = domain;
                }
            }
        });
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

        layerArray.length && layerArray.forEach((layer) => {
            const def = layerFactory.getSerializedConf(layer.mark, layer);
            serializedLayers.push({
                mark: layer.mark,
                def
            });
        });
        return serializedLayers;
    }

    /**
     *
     *
     * @param {*} fields
     * @param {*} userLayerConfig
     * @return
     * @memberof CartesianEncoder
     */
    getLayerConfig (fields, userLayerConfig) {
        const layerConfig = [];
        const {
            columnFields,
            rowFields
        } = fields;

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

                configs = [{
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
                        const def = layerConf.def;
                        if (def instanceof Array) {
                            configs[0].def.mark = mark;
                            return {
                                mark: layerConf.mark,
                                def: def.map(conf => mergeRecursive(mergeRecursive({}, configs[0].def), conf))
                            };
                        }
                        return mergeRecursive(mergeRecursive({}, configs[0]), layerConf);
                    });
                }

                layerConfig.push(...configs);
            });
        });
        return layerConfig;
    }

    getAggregationFns (groupByFns) {
        return groupByFns;
    }
}

