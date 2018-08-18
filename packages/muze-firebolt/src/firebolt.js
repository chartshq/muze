import { mergeRecursive, getElementsByClassName, hasTouch, filterPropagationModel, FieldType } from 'muze-utils';
import SelectionSet from './selection-set';
import {
    initializeBehaviouralActions,
    initializeSideEffects,
    changeSideEffectAvailability,
    initializePhysicalActions,
    setSelectionSets,
    getSetInfo,
    getMergedSet,
    getSourceFields
} from './helper';

/**
 * Relient firebolt is responsible for dispatching behaviours. It has only behaviours which can be
 * dispatched without any physical action being triggered.
 */
export default class Firebolt {
    constructor (context, actions, sideEffects, behaviourEffectMap) {
        this.context = context;
        this._sideEffectDefinitions = {};
        this._sideEffects = {};
        this._actions = {
            behavioural: {},
            physical: {}
        };
        this._linkedActions = {};
        this._sourceSideEffects = {
            tooltip: true,
            selectionBox: true
        };
        this._actionBehaviourMap = {};
        this._config = {};
        this._behaviourEffectMap = {};

        this.mapSideEffects(behaviourEffectMap);
        this.registerBehaviouralActions(actions.behavioural);
        this.registerSideEffects(sideEffects);
        this.registerPhysicalBehaviouralMap(actions.physicalBehaviouralMap);
        this.registerPhysicalActions(actions.physical);
    }

    config (...config) {
        if (config.length) {
            const conf = this._config = mergeRecursive(this._config, config[0]);
            const sideEffects = this.sideEffects();
            for (const key in sideEffects) {
                if ({}.hasOwnProperty.call(sideEffects, key)) {
                    const sideEffectConf = conf[key];
                    sideEffectConf && sideEffects[key].config(sideEffectConf);
                }
            }
            return this;
        }
        return this._config;
    }

    mapSideEffects (behEffectMap) {
        const behaviourEffectMap = this._behaviourEffectMap;
        for (const key in behEffectMap) {
            if ({}.hasOwnProperty.call(behEffectMap, key)) {
                const sideEffects = behEffectMap[key] || [];
                !behaviourEffectMap[key] && (behaviourEffectMap[key] = []);
                this._behaviourEffectMap[key] = [...new Set([...behaviourEffectMap[key], ...sideEffects])];
            }
        }
        return this;
    }

    registerBehaviouralActions (actions) {
        const behaviours = initializeBehaviouralActions(this, actions);
        Object.assign(this._actions.behavioural, behaviours);
        return this;
    }

    registerSideEffects (sideEffects) {
        for (const key in sideEffects) {
            this._sideEffectDefinitions[sideEffects[key].formalName()] = sideEffects[key];
        }
        return this;
    }

    applySideEffects (sideEffects, selectionSet, payload) {
        const sideEffectStore = this.sideEffects();
        sideEffects.forEach((sideEffect) => {
            let strategy;
            let name;
            if (typeof sideEffect === 'object') {
                name = sideEffect.name;
                strategy = sideEffect.strategy;
            } else {
                name = sideEffect;
            }

            const sideEffectInstance = sideEffectStore[name];
            if (sideEffectInstance.enabled) {
                sideEffectStore[name].apply(selectionSet, payload, strategy);
            }
        });
        return this;
    }

    dispatchBehaviour (behaviourName, payload) {
        const action = this._actions.behavioural[behaviourName];
        const sideEffects = this._behaviourEffectMap[behaviourName];

        if (action) {
            const selectionSet = action(payload);
            this.applySideEffects(sideEffects, selectionSet, payload);
        }
    }

    sideEffects (...sideEffects) {
        if (sideEffects.length) {
            this._sideEffects = sideEffects[0];
            return this;
        }
        return this._sideEffects;
    }

    enable (fn) {
        changeSideEffectAvailability(this.sideEffects(), fn, true);
        return this;
    }

    disable (fn) {
        changeSideEffectAvailability(this.sideEffects(), fn, false);
        return this;
    }

    attachPropagationListener (dataModel) {
        dataModel.unsubscribe('propagation');
        dataModel.on('propagation', this.onDataModelPropagation());
        return this;
    }

    onDataModelPropagation () {
        return (propValue) => {
            const payload = propValue.payload;
            const action = payload.action;

            this.dispatchBehaviour(action, payload, {
                propagate: false
            });
        };
    }

    createSelectionSet (uniqueIds) {
        const behaviours = this._actions.behavioural;
        const selectionSet = {};
        const volatileSelectionSet = {};

        for (const key in behaviours) {
            if ({}.hasOwnProperty.call(behaviours, key)) {
                selectionSet[key] = new SelectionSet(uniqueIds);
                volatileSelectionSet[key] = new SelectionSet(uniqueIds, true);
            }
        }
        this._volatileSelectionSet = volatileSelectionSet;
        this.selectionSet(selectionSet);
        return this;
    }

    selectionSet (...selectionSet) {
        if (selectionSet.length) {
            this._selectionSet = selectionSet[0];
            return this;
        }
        return this._selectionSet;
    }

    initializeSideEffects () {
        const sideEffectDefinitions = this._sideEffectDefinitions;
        this.sideEffects(initializeSideEffects(this, sideEffectDefinitions));
        return this;
    }

    registerPhysicalActions (actions) {
        const initedActions = initializePhysicalActions(this, actions);
        Object.assign(this._actions.physical, initedActions);
        return this;
    }

    /**
     * Map actions and behaviours
     * @return {Firebolt} Firebolt instance
     */
    mapActionsAndBehaviour () {
        const initedPhysicalActions = this._actions.physical;
        const map = this._actionBehaviourMap;

        for (const action in map) {
            if (!({}).hasOwnProperty.call(action, map)) {
                let target;
                const mapObj = map[action];
                target = mapObj.target;
                const touch = mapObj.touch;
                if (!target) {
                    target = this.context.getDefaultTargetContainer();
                }
                const bind = hasTouch() ? touch === true || touch === undefined : !touch;
                bind && this.bindActionWithBehaviour(initedPhysicalActions[action], target, mapObj.behaviours);
            }
        }
        return this;
    }

    registerPhysicalBehaviouralMap (map) {
        Object.assign(this._actionBehaviourMap, map);
        return this;
    }

    /**
     * Binds a target element with an action.
     * @param {Function} action Action method
     * @param {string} target Class name of element
     * @param {Array} behaviourList Array of behaviours
     * @return {FireBolt} Instance of firebolt
     */
    bindActionWithBehaviour (action, targets, behaviourList) {
        if (typeof (targets) === 'string') {
            targets = [targets];
        }
        targets.forEach((target) => {
            const nodes = getElementsByClassName(this.context.mount(), `.${target}`);
            if (nodes) {
                nodes.forEach((node) => {
                    action(node, behaviourList);
                });
            }
        });
        return this;
    }

    /**
     * Selects tuples from the datamodel and returns an entry set and an exit set of the selection.
     * It also accepts unique ids of the tuples directly.
     * @param {Function|Array.<string>} selVal Filter method to select tuples or unique ids.
     * @return {Array} Entry set and exit set of selection.
     */
    select (criteria, action, config, propagationInf = {}) {
        return () => {
            const returnSet = null;
            return () => {
                if (returnSet) {
                    return returnSet;
                }
                const sourceId = this.context.id();
                const propagationSource = propagationInf.sourceId;
                let applicableSelectionSets = [];
                if (propagationSource !== sourceId) {
                    applicableSelectionSets = [this._volatileSelectionSet[action]];
                }

                if (propagationSource) {
                    applicableSelectionSets.push(this.selectionSet()[action]);
                }

                const persistent = config.persist;

                const {
                    model: filteredDataModel,
                    uids
                } = this.getAddSetFromCriteria(criteria, propagationInf);

                const dataModel = this.getFullData();

                const returnSets = applicableSelectionSets.map((selectionSet) => {
                    setSelectionSets(uids, selectionSet, persistent);
                    const {
                        entrySet,
                        exitSet,
                        completeSet
                    } = selectionSet.getSets();

                    const setConfig = {
                        isSourceFieldPresent: propagationInf.isSourceFieldPresent,
                        dataModel,
                        filteredDataModel,
                        propagationData: propagationInf.data,
                        set: selectionSet._set
                    };

                    return {
                        entrySet: [getSetInfo('oldEntry', entrySet[0], setConfig),
                            getSetInfo('newEntry', entrySet[1], setConfig)],
                        exitSet: [getSetInfo('oldEntry', exitSet[0], setConfig),
                            getSetInfo('newExit', exitSet[1], setConfig)],
                        mergedEnter: getSetInfo('mergedEnter', getMergedSet(entrySet), setConfig),
                        mergedExit: getSetInfo('mergedExit', getMergedSet(exitSet), setConfig),
                        completeSet: getSetInfo('complete', completeSet, setConfig),
                        isSourceFieldPresent: propagationInf.isSourceFieldPresent,
                        fields: getSourceFields(propagationInf, criteria),
                        sourceSelectionSet: selectionSet._volatile === true
                    };
                });
                return returnSets;
            };
        };
    }

    getAddSetFromCriteria (criteria, propagationInf = {}) {
        const context = this.context;
        const filteredDataModel = propagationInf.data ? propagationInf.data :
            context.getDataModelFromIdentifiers(criteria);
        const xFields = context.fields().x || [];
        const yFields = context.fields().y || [];
        const xMeasures = xFields.every(field => field.type() === FieldType.MEASURE);
        const yMeasures = yFields.every(field => field.type() === FieldType.MEASURE);
        return {
            model: filteredDataModel,
            uids: criteria === null ? null : (propagationInf.data ? filterPropagationModel(this.getFullData(),
                propagationInf.data[0], xMeasures && yMeasures).getData().uids : filteredDataModel[0].getData().uids)
        };
    }

    getFullData () {
        return this.context.data();
    }
}
