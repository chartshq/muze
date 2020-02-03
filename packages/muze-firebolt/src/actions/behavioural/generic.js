import {
    isSimpleObject,
    DimensionSubtype,
    partition,
    ReservedFields
} from 'muze-utils';
import { getSourceFields } from '../../helper';
import { EntryExitSet } from '../../entry-exit-set';

/**
 * This is the base class has all the common functionalities needed for all behavioural actions. Any other behavioural
 * action needs to extend this class.
 *
 * @public
 * @class GenericBehaviour
 * @module GenericBehaviour
 */
export default class GenericBehaviour {
    constructor (firebolt) {
        this.firebolt = firebolt;
        this._enabled = true;
    }

    /**
     * Returns entry and exit set information. This method is called by firebolt when ```dispatchBehaviour``` is called
     * dynamically or when any physical action is triggered on the chart.
     *
     * @param {Object} payload Payload information.
     * @param {Object|Array} payload.criteria Identifiers of data interacted with.
     *
     * @return {Array} Entry and exit set information.
     */
    dispatch (payload) {
        const criteria = payload.criteria;
        const firebolt = this.firebolt;
        const formalName = this.constructor.formalName();
        const selectionSet = firebolt.getSelectionSet(formalName);
        const propInf = this.firebolt.getPropagationInf();
        const {
            model: filteredDataModel,
            uids
        } = this.getAddSetFromCriteria(criteria, this.firebolt.getPropagationInf());
        this._payload = payload;

        this.setSelectionSet(uids, selectionSet, {
            filteredDataModel,
            payload
        });
        if (!propInf.sourceId) {
            this.propagationIdentifiers(selectionSet, payload);
        }
        this.entryExitSet(selectionSet, filteredDataModel, payload);
    }

    getAddSetFromCriteria (...params) {
        return this.firebolt.getAddSetFromCriteria(...params);
    }

    /**
     * Updates the selection set by adding uids to the instance of {@link SelectionSet} or removing them.
     * {@link SelectionSet} keeps the information of which rows are in the entry set and exit set.
     *
     * @public
     * @param {Array} addSet Array of row ids which got affected during interaction.
     * @param {SelectionSet} selectionSet Instance of selection set.
     *
     * @return {GenericBehaviour} Instance of behaviour.
     */
    setSelectionSet () {
        return this;
    }

    entryExitSet (...params) {
        if (params.length) {
            const [selectionSet, filteredDataModel, payload] = params;
            const {
                entrySet,
                exitSet,
                mergedEnter,
                mergedExit,
                completeSet
            } = selectionSet.getSets();
            const propagationInf = this.firebolt.getPropagationInf();

            this._entryExitSet = {
                entrySet: [this.getSetInfo('oldEntry', entrySet[0], filteredDataModel),
                    this.getSetInfo('newEntry', entrySet[1], filteredDataModel)],
                exitSet: [this.getSetInfo('oldEntry', exitSet[0], filteredDataModel),
                    this.getSetInfo('newExit', exitSet[1], filteredDataModel)],
                mergedEnter: this.getSetInfo('mergedEnter', mergedEnter, filteredDataModel),
                mergedExit: this.getSetInfo('mergedExit', mergedExit, filteredDataModel),
                completeSet: this.getSetInfo('complete', completeSet, filteredDataModel),
                fields: getSourceFields(propagationInf, payload.criteria)
            };

            return this;
        }
        return this._entryExitSet;
    }

    getSetInfo (type, set, filteredDataModel) {
        const { sourceId } = this.firebolt.getPropagationInf();
        const data = this.firebolt.data();

        return new EntryExitSet({
            uids: set,
            filteredModel: (fullData) => {
                let model = null;
                if (type === 'complete') {
                    return fullData;
                } else if (type === 'mergedEnter' && sourceId) {
                    model = filteredDataModel;
                } else {
                    const uidMap = set.reduce((acc, v) => {
                        acc[v[0]] = 1;
                        return acc;
                    }, {});
                    model = fullData.select(fields => fields[ReservedFields.ROW_ID] in uidMap, {
                        saveChild: false
                    });
                }
                return model;
            },
            data
        });
    }

    propagationIdentifiers (...params) {
        if (params.length) {
            let propData = null;
            const [selectionSet, payload] = params;
            const fieldsConfig = this.firebolt.data().getFieldsConfig();
            const { criteria } = payload;
            const propagationFields = this._propagationFields;

            if (selectionSet.resetted() || criteria === null) {
                propData = null;
            } else if (isSimpleObject(criteria)) {
                const fields = Object.keys(criteria);
                const [, otherFields] =
                    partition(fields, (d => (fieldsConfig[d] ? fieldsConfig[d].def.subtype ===
                        DimensionSubtype.CATEGORICAL : d === ReservedFields.MEASURE_NAMES)));
                const allFields = fields.filter(d => d === ReservedFields.ROW_ID ||
                    fieldsConfig[d] && fieldsConfig[d].def.subtype === DimensionSubtype.CATEGORICAL);
                const { mergedEnter } = selectionSet.getSets({ keepDims: true, fields: allFields });
                propData = {
                    fields: fields.map(d => (fieldsConfig[d] ? fieldsConfig[d].def : {
                        name: d
                    })),
                    range: this.firebolt.getRangeFromIdentifiers({
                        criteria,
                        entrySet: selectionSet.getSets().mergedEnter,
                        fields: otherFields
                    }),
                    identifiers: [[...allFields, ReservedFields.MEASURE_NAMES], ...mergedEnter]
                };
            } else {
                const fields = propagationFields ? [...propagationFields, ReservedFields.MEASURE_NAMES] :
                    criteria[0];
                const { mergedEnter } = selectionSet.getSets({ keepDims: true, fields });

                propData = {
                    fields: fields.map(d => (fieldsConfig[d] ? fieldsConfig[d].def : {
                        name: d
                    })),
                    identifiers: [fields, ...mergedEnter]
                };
            }
            this._propagationIdentifiers = propData;
            return this;
        }
        return this._propagationIdentifiers;
    }

    static mutates () {
        return false;
    }

    enable () {
        this._enabled = true;
    }

    disable () {
        this._enabled = false;
    }

    isEnabled () {
        return this._enabled;
    }

    propagateWith (...params) {
        this._propagationFields = params[0];

        return this;
    }
}

