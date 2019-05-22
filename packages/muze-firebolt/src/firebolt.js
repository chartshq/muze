import {
    mergeRecursive,
    hasTouch,
    selectElement,
    isSimpleObject
} from 'muze-utils';
import { ALL_ACTIONS } from './enums/actions';
import SelectionSet from './selection-set';
import {
    initializeBehaviouralActions,
    initializeSideEffects,
    changeSideEffectAvailability,
    initializePhysicalActions,
    unionSets,
    getSideEffects,
    setSideEffectConfig
} from './helper';

/**
 * This class is responsible for dispatching behavioural actions and side effects. It also keeps the information of
 * registered physical actions, behavioural actions and side effects. Also, it keeps the map of physical and behavioural
 * actions and behavioural actions and side effects. Whenever any behavioural action is dispatched, it also propagates
 * the rows which got affected to the other datamodels. This class is initialized by {@link VisualUnit} and legend to
 * manage it's interaction.
 *
 * @public
 * @class Firebolt
 * @module Firebolt
 */
export default class Firebolt {
    constructor (context, actions, sideEffects, behaviourEffectMap) {
        this.context = context;
        this._sideEffectDefinitions = {};
        this._sideEffects = {};
        this._propagationInf = {};
        this._actions = {
            behavioural: {},
            physical: {}
        };
        this._selectionSet = {};
        this._volatileSelectionSet = {};
        this._propagationFields = {};
        this._sourceSideEffects = {};
        this._propagationBehaviourMap = {};
        this._sourceBehaviours = {};
        this._actionBehaviourMap = {};
        this._config = {};
        this._behaviourEffectMap = {};
        this._entryExitSet = {};
        this._actionHistory = {};
        this._queuedSideEffects = {};

        this.mapSideEffects(behaviourEffectMap);
        this.registerBehaviouralActions(actions.behavioural);
        this.registerSideEffects(sideEffects);
        this.registerPhysicalBehaviouralMap(actions.physicalBehaviouralMap);
        this.registerPhysicalActions(actions.physical);
    }

    config (...config) {
        if (config.length) {
            this._config = mergeRecursive(this._config, config[0]);
            setSideEffectConfig(this.sideEffects(), this._config);
            return this;
        }
        return this._config;
    }

    mapSideEffects (behEffectMap) {
        const behaviourEffectMap = this._behaviourEffectMap;
        for (const key in behEffectMap) {
            if ({}.hasOwnProperty.call(behEffectMap, key)) {
                const sideEffects = behEffectMap[key] || [];
                let preventDefaultActions = false;
                let effectNames;
                if (isSimpleObject(sideEffects)) {
                    effectNames = sideEffects.effects;
                    preventDefaultActions = sideEffects.preventDefaultActions;
                } else {
                    effectNames = sideEffects;
                }
                !behaviourEffectMap[key] && (behaviourEffectMap[key] = []);
                this._behaviourEffectMap[key] = [...new Set(preventDefaultActions ? effectNames :
                    [...behaviourEffectMap[key], ...effectNames])];
            }
        }
        return this;
    }

    registerBehaviouralActions (actions) {
        const behaviours = initializeBehaviouralActions(this, actions);
        this.prepareSelectionSets(behaviours);
        Object.assign(this._actions.behavioural, behaviours);
        return this;
    }

    prepareSelectionSets () {
        return this;
    }

    registerSideEffects (sideEffects) {
        for (const key in sideEffects) {
            this._sideEffectDefinitions[sideEffects[key].formalName()] = sideEffects[key];
        }
        this.initializeSideEffects();
        return this;
    }

    applySideEffects (sideEffects, selectionSet, payload) {
        const sideEffectStore = this.sideEffects();
        const actionHistory = this._actionHistory;
        const queuedSideEffects = this._queuedSideEffects;
        sideEffects.forEach((sideEffect) => {
            let options;
            let name;
            const effects = sideEffect.effects;
            const behaviours = sideEffect.behaviours;
            const combinedSet = unionSets(this, behaviours, selectionSet);
            effects.forEach((effect) => {
                if (typeof effect === 'object') {
                    name = effect.name;
                    options = effect.options;
                } else {
                    name = effect;
                }

                const sideEffectInstance = sideEffectStore[name];
                if (sideEffectInstance.isEnabled()) {
                    if (!sideEffectInstance.constructor.mutates() &&
                        Object.values(actionHistory).some(d => d.isMutableAction)) {
                        queuedSideEffects[`${name}-${behaviours.join()}`] = {
                            name,
                            params: [combinedSet, payload, options]
                        };
                    } else {
                        this.dispatchSideEffect(name, combinedSet, payload, options);
                    }
                }
            });
        });
        return this;
    }

    dispatchSideEffect (name, selectionSet, payload, options = {}) {
        const sideEffectStore = this.sideEffects();
        const sideEffect = sideEffectStore[name];
        let disable = false;
        if (options.filter && options.filter(sideEffect)) {
            disable = true;
        }
        !disable && sideEffectStore[name].apply(selectionSet, payload, options);
    }

    registerPropagationBehaviourMap (map) {
        this._propagationBehaviourMap = Object.assign(this._propagationBehaviourMap, map || {});
        return this;
    }

    dispatchBehaviour (behaviour, payload, propagationInfo = {}) {
        const propagate = propagationInfo.propagate !== undefined ? propagationInfo.propagate : true;
        const behaviouralActions = this._actions.behavioural;
        const action = behaviouralActions[behaviour];
        const behaviourEffectMap = this._behaviourEffectMap;
        const sideEffects = getSideEffects(behaviour, behaviourEffectMap);
        this._propagationInf = propagationInfo;

        if (action) {
            const selectionSet = action.dispatch(payload);
            const propagationSelectionSet = this.getPropagationSelectionSet(selectionSet);
            this._entryExitSet[behaviour] = propagationSelectionSet;
            const shouldApplySideEffects = this.shouldApplySideEffects(propagate);

            if (propagate) {
                this.propagate(behaviour, payload, selectionSet.find(d => d.sourceSelectionSet), sideEffects);
            }
            if (shouldApplySideEffects) {
                const applicableSideEffects = this.getApplicableSideEffects(sideEffects, payload, propagationInfo);
                this.applySideEffects(applicableSideEffects, propagationSelectionSet, payload);
            }
        }

        return this;
    }

    getPropagationSelectionSet (selectionSet) {
        return selectionSet.find(d => !d.sourceSelectionSet);
    }

    shouldApplySideEffects () {
        return true;
    }

    changeBehaviourStateOnPropagation (behaviour, value, key = 'default') {
        const behaviourConditions = this._sourceBehaviours[behaviour] || (this._sourceBehaviours[behaviour] = {});
        if (value instanceof Function) {
            behaviourConditions[key] = value;
        } else {
            behaviourConditions[key] = () => value;
        }
        return this;
    }

    changeSideEffectStateOnPropagation (sideEffect, value, key = 'default') {
        const sideEffectConditions = this._sourceSideEffects[sideEffect] || (this._sourceSideEffects[sideEffect] = {});
        if (value instanceof Function) {
            sideEffectConditions[key] = value;
        } else {
            sideEffectConditions[key] = () => value;
        }
    }

    removeSideEffectPolicy (sideEffect, key) {
        delete this._sourceSideEffects[sideEffect][key];
        return this;
    }

    removeBehaviourPolicy (behaviour, key) {
        delete this._sourceBehaviours[behaviour][key];
        return this;
    }

    propagate () {
        return this;
    }

    sideEffects (...sideEffects) {
        if (sideEffects.length) {
            this._sideEffects = sideEffects[0];
            return this;
        }
        return this._sideEffects;
    }

    enableSideEffects (fn) {
        changeSideEffectAvailability(this, fn, true);
        return this;
    }

    disableSideEffects (fn) {
        changeSideEffectAvailability(this, fn, false);
        return this;
    }

    dissociateBehaviour (behaviour, physicalAction) {
        const actionBehaviourMap = this._actionBehaviourMap;
        for (const key in actionBehaviourMap) {
            if (key === physicalAction) {
                const behaviourMap = actionBehaviourMap[key];
                behaviourMap.behaviours = behaviourMap.behaviours.filter(d => d !== behaviour);
                this.mapActionsAndBehaviour(key);
            }
        }

        return this;
    }

    dissociateSideEffect (sideEffect, behaviour) {
        const behaviourEffectMap = this._behaviourEffectMap;
        behaviourEffectMap[behaviour] = behaviourEffectMap[behaviour].filter(d => (d.name || d) !== sideEffect);
        return this;
    }

    getApplicableSideEffects (sideEffects) {
        return sideEffects;
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

    createSelectionSet (uniqueIds, behaviouralActions) {
        const behaviours = behaviouralActions || this._actions.behavioural;
        const selectionSet = this._selectionSet;
        const volatileSelectionSet = this._volatileSelectionSet;

        for (const key in behaviours) {
            if ({}.hasOwnProperty.call(behaviours, key)) {
                selectionSet[key] = new SelectionSet(uniqueIds);
                volatileSelectionSet[key] = new SelectionSet(uniqueIds, true);
                this._entryExitSet[key] = null;
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
     * Allows to propagate the datamodel with only the supplied fields. When propagation is done, then the fields
     * which are supplied for the specified behavioural action is propagated.
     *
     * @public
     *
     * @param {string} action Name of behavioural action. If '*' is specified, then for all behavioural actions it is
     * applied.
     * @param {Array} fields Array of field names which will be propagated.
     * @param {boolean} append If true, then it is appended to the existing propagation data model fields else only
     * those fields are projected from propagation data model and propagated.
     *
     * @return {Firebolt} Instance of firebolt
     */
    propagateWith (action, fields, append = false) {
        const behaviouralActions = this._actions.behavioural;
        if (action === ALL_ACTIONS) {
            for (const key in behaviouralActions) {
                this._propagationFields[key] = {
                    fields,
                    append
                };
            }
        } else {
            this._propagationFields[action] = {
                fields,
                append
            };
        }
        return this;
    }

    /**
     * Map actions and behaviours
     * @return {Firebolt} Firebolt instance
     */
    mapActionsAndBehaviour (phyAction) {
        const initedPhysicalActions = this._actions.physical;
        const map = this._actionBehaviourMap;

        for (const action in map) {
            if (!({}).hasOwnProperty.call(action, map) && action === (phyAction || action)) {
                let target;
                const mapObj = map[action];
                target = mapObj.target;
                const touch = mapObj.touch;
                if (!target) {
                    target = this.context.getDefaultTargetContainer();
                }
                const bind = hasTouch() ? touch === true || touch === undefined : !touch;
                bind && this.bindActionWithBehaviour(initedPhysicalActions[action],
                    target, mapObj.behaviours);
            }
        }
        return this;
    }

    registerPhysicalBehaviouralMap (map) {
        this._actionBehaviourMap = mergeRecursive(this._actionBehaviourMap, map);
        return this;
    }

    /**
     * Binds a target element with an action.
     *
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
            const mount = this.context.mount();
            const nodes = target.node instanceof Function ? target : selectElement(mount).selectAll(target);
            if (!nodes.empty()) {
                if (nodes instanceof Array) {
                    nodes.forEach((node) => {
                        action(selectElement(node), behaviourList);
                    });
                } else {
                    action(nodes, behaviourList);
                }
            }
        });
        return this;
    }

    getPropagationInf () {
        return this._propagationInf;
    }

    getAddSetFromCriteria (criteria, propagationInf = {}) {
        const context = this.context;
        const filteredDataModel = propagationInf.data ? propagationInf.data :
            context.getDataModelFromIdentifiers(criteria, 'all');
        return {
            model: filteredDataModel,
            uids: criteria === null ? null : (propagationInf.data ? propagationInf.entryRowIds :
                filteredDataModel[0].getUids())
        };
    }

    getSelectionSets (action) {
        const sourceId = this.context.id();
        const propagationInf = this._propagationInf || {};
        const propagationSource = propagationInf.sourceId;
        let applicableSelectionSets = [];
        if (propagationSource !== sourceId) {
            applicableSelectionSets = [this._volatileSelectionSet[action]];
        }

        if (propagationSource) {
            applicableSelectionSets.push(this.selectionSet()[action]);
        }
        return applicableSelectionSets;
    }

    getFullData () {
        return this.context.data();
    }

    resetted () {
        return this._resetted;
    }

    /**
     * Returns the entry and exit set information of the specified behavioural action.
     *
     * @public
     *
     * @param {string} behaviour Name of behavioural action.
     *
     * @return {Object} Entry exit set information.
     */
    getEntryExitSet (behaviour) {
        return this._entryExitSet[behaviour];
    }
}
