import { Firebolt } from '@chartshq/muze-firebolt';
import DataModel from 'datamodel';
import { FieldType, DimensionSubtype, isSimpleObject, CommonProps, transposeArray, concatModels } from 'muze-utils';
import * as COMPONENTS from '../enums/components';
import { changeSideEffectAvailability, getDrawingContext, getSourceInfo, getMarksFromIdentifiers } from './helper';

export default class GroupFireBolt extends Firebolt {
    dispatchBehaviour (behaviour, payload) {
        const propPayload = Object.assign(payload);
        const criteria = propPayload.criteria;
        const data = this.context.data();
        const fieldsConfig = data.getFieldsConfig();

        propPayload.action = behaviour;
        if (isSimpleObject(criteria)) {
            const fields = Object.keys(criteria || {});
            const isAllFieldContinous = fields.every((field) => {
                const type = fieldsConfig[field].def.subtype || fieldsConfig[field].def.type;
                return type === FieldType.MEASURE || type === FieldType.TEMPORAL;
            });

            if (isAllFieldContinous) {
                data.propagateInterpolatedValues(criteria || {}, payload);
            } else {
                const values = Object.values(criteria);
                data.propagate([fields, ...transposeArray(values)], payload);
            }
        } else {
            data.propagate(criteria || [], propPayload);
        }

        return this;
    }

    throwback (throwback) {
        const context = this.context;

        context.getValueMatrix().each((el) => {
            el.valueOf().firebolt().throwback(throwback);
        });

        throwback.registerChangeListener([CommonProps.ACTION_INF], ([, actionInf]) => {
            if (actionInf !== null) {
                for (const action in actionInf) {
                    const payload = actionInf[action].payload;
                    const sourceUnit = actionInf[action].sourceUnit;
                    this.applySideEffects(action, payload, sourceUnit);
                }
                throwback.commit(CommonProps.ACTION_INF, null);
            }
        });

        return this;
    }

    applySideEffects (behaviour, payload, sourceUnitId) {
        const sideEffects = payload.sideEffects || this._behaviourEffectMap[behaviour];
        const context = this.context;
        const viewInf = context.layout().getViewInformation().viewMatricesInfo;
        const viewMatrix = viewInf.matrices.center[1];
        const visualGroup = context.composition().visualGroup;
        const sourceSideEffects = this._sourceSideEffects;
        const sourceUnit = visualGroup.findUnitById(sourceUnitId);
        const sideEffectStore = this.sideEffects();
        const facetFields = sourceUnit && sourceUnit.facetByFields();

        sideEffects.forEach((sideEffect) => {
            let strategy;
            let name;

            if (typeof sideEffect === 'object') {
                name = sideEffect.name;
                strategy = sideEffect.strategy;
            } else {
                name = sideEffect;
            }

            const sideEffectInstances = sideEffectStore[name];
            for (const key in sideEffectInstances) {
                const instance = sideEffectInstances[key];
                const facetKeys = key.split(',');
                const enabled = instance.enabled;
                let sourceEnabled = true;
                if (facetFields && key && !facetKeys.every(d => facetFields[1].indexOf(d) !== -1)) {
                    sourceEnabled = !sourceSideEffects[sideEffect];
                }
                if (enabled && sourceEnabled) {
                    const cells = visualGroup.getCellsByFacetKey(key);
                    if (viewMatrix.some(arr => arr.indexOf(cells && cells[0]) !== -1)) {
                        const selectionSet = this.getSelectionSetFromUnits(payload.criteria, key, behaviour)();
                        payload.sourceUnit = sourceUnitId;
                        instance.apply(selectionSet, payload, strategy);
                    }
                }
            }
        });
    }

    registerSideEffects (sideEffects) {
        for (const key in sideEffects) {
            if (sideEffects[key].target() !== COMPONENTS.UNIT) {
                this._sideEffectDefinitions[sideEffects[key].formalName()] = sideEffects[key];
            }
        }
        return this;
    }

    initializeSideEffects () {
        let cells;
        let hStack = true;
        let vStack = true;

        const canvas = this.context;
        const sideEffectDefinitions = this._sideEffectDefinitions;
        const sideEffects = this._sideEffects;
        const xFields = canvas.getFieldsFromChannel('x');
        const yFields = canvas.getFieldsFromChannel('y');
        if (xFields.length) {
            const xFieldType = xFields[0][xFields[0].length - 1].type();
            vStack = vStack && (xFieldType === FieldType.DIMENSION || xFieldType === DimensionSubtype.TEMPORAL);
        }
        if (yFields.length) {
            const yFieldType = yFields[0][yFields[0].length - 1].type();
            hStack = hStack && (yFieldType === FieldType.DIMENSION || yFieldType === DimensionSubtype.TEMPORAL);
        }

        if (hStack) {
            cells = canvas.composition().visualGroup.getCells('row');
        } else if (vStack) {
            cells = canvas.composition().visualGroup.getCells('col');
        }

        for (const key in cells) {
            if ({}.hasOwnProperty.call(cells, key)) {
                for (const name in sideEffectDefinitions) {
                    if ({}.hasOwnProperty.call(sideEffectDefinitions, name)) {
                        const Cls = sideEffectDefinitions[name];
                        !sideEffects[name] && (sideEffects[name] = {});
                        const sideEffect = sideEffects[name][key] = new Cls(this);
                        sideEffect.drawingContext(getDrawingContext(canvas, key));
                        sideEffect.sourceInf(getSourceInfo(canvas, key));
                        sideEffect.marksFromIdentifiers(getMarksFromIdentifiers(canvas, key));
                    }
                }
            }
        }
        return this;
    }

    getSelectionSetFromUnits (identifiers, facetKey, action) {
        return () => {
            let selectionSet = null;
            return () => {
                if (selectionSet) {
                    return selectionSet;
                }
                const context = this.context;
                const visualGroup = context.composition().visualGroup;
                const units = visualGroup.getCellsByFacetKey(facetKey).map(d => d.valueOf());
                let model = null;
                if (identifiers !== null) {
                    units.forEach((unit) => {
                        const set = unit.firebolt().getEntryExitSet(action);
                        if (set) {
                            const entryModel = set().entrySet.model;
                            if (entryModel && model) {
                                const [data, schema] = concatModels(entryModel, model);
                                model = new DataModel(data, schema);
                            } else {
                                model = entryModel;
                            }
                        }
                    });
                }

                selectionSet = {
                    entrySet: {
                        model
                    }
                };
                return selectionSet;
            };
        };
    }

    disable (fn) {
        changeSideEffectAvailability(this.sideEffects(), fn, false);
        return this;
    }

    enable (fn) {
        changeSideEffectAvailability(this.sideEffects(), fn, true);
        return this;
    }
}
