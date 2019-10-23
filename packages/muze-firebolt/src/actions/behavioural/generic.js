import { isSimpleObject, DimensionSubtype, partition, FieldType, ReservedFields } from 'muze-utils';
import { getMergedSet, getSourceFields } from '../../helper';

export const getIdentifiersFromSet = (set, context, { fieldsConfig, fields }) => {
    const data = [[]];

    if (fields.length) {
        data[0] = fields;
        set.forEach(id => data.push(context.getValueFromId(id, fields, fieldsConfig)));
    }
    return data;
};

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
        const selectionSets = firebolt.getSelectionSets(formalName);
        const {
            model: filteredDataModel,
            uids
        } = this.getAddSetFromCriteria(criteria, this.firebolt.getPropagationInf());

        selectionSets.forEach((selectionSet) => {
            this.setSelectionSet(uids, selectionSet, {
                filteredDataModel,
                payload
            });

            selectionSet._volatile && this.propagationIdentifiers(selectionSet, payload);
            this.entryExitSet(selectionSet, filteredDataModel, payload);
        });
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
                completeSet
            } = selectionSet.getSets();
            const propagationInf = this.firebolt.getPropagationInf();

            this._entryExitSet = {
                entrySet: [this.getSetInfo('oldEntry', entrySet[0], filteredDataModel),
                    this.getSetInfo('newEntry', entrySet[1], filteredDataModel)],
                exitSet: [this.getSetInfo('oldEntry', exitSet[0], filteredDataModel),
                    this.getSetInfo('newExit', exitSet[1], filteredDataModel)],
                mergedEnter: this.getSetInfo('mergedEnter', getMergedSet(entrySet), filteredDataModel),
                mergedExit: this.getSetInfo('mergedExit', getMergedSet(exitSet), filteredDataModel),
                completeSet: this.getSetInfo('complete', completeSet, filteredDataModel),
                fields: getSourceFields(propagationInf, payload.criteria)
            };

            return this;
        }
        return this._entryExitSet;
    }

    getSetInfo (type, set, filteredDataModel) {
        let model = null;

        if (type === 'mergedEnter') {
            model = filteredDataModel ? filteredDataModel[0] : null;
        } else if (type === 'mergedExit') {
            model = filteredDataModel ? filteredDataModel[1] : null;
        }

        return {
            uids: set,
            length: set.length,
            model
        };
    }

    propagationIdentifiers (...params) {
        if (params.length) {
            let propData = null;
            const [selectionSet, payload] = params;
            const { context } = this.firebolt;
            const fieldsConfig = this.firebolt.data().getFieldsConfig();
            const { criteria } = payload;

            if (selectionSet.resetted() || criteria === null) {
                propData = null;
            } else if (isSimpleObject(criteria)) {
                const fields = isSimpleObject(criteria) ? Object.keys(criteria) : criteria[0];
                // const fields = Object.keys(criteria);
                const [dims, otherFields] =
                    partition(fields, (d => fieldsConfig[d].def.subtype === DimensionSubtype.CATEGORICAL));

                propData = {
                    fields: fields.map(d => fieldsConfig[d].def),
                    range: context.getRangeFromIdentifiers({
                        criteria,
                        entrySet: selectionSet.getMergedEntrySet(),
                        fields: otherFields
                    }),
                    identifiers: getIdentifiersFromSet(selectionSet.getMergedEntrySet(), context, {
                        fields: dims,
                        fieldsConfig
                    })
                };
            } else {
                const data = getIdentifiersFromSet(selectionSet.getMergedEntrySet(), context, {
                    fields: criteria[0].filter(field => field === ReservedFields.ROW_ID ||
                        fieldsConfig[field].def.type === FieldType.DIMENSION),
                    fieldsConfig
                });
                propData = {
                    fields: data[0].map(d => (d === ReservedFields.ROW_ID ? { name: ReservedFields.ROW_ID } :
                        fieldsConfig[d].def)),
                    identifiers: data
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
}

