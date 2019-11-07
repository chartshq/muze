import { isSimpleObject, DimensionSubtype, partition, ReservedFields } from 'muze-utils';
import { getMergedSet, getSourceFields } from '../../helper';

export const getIdentifiersFromSet = (set, context, { fields }) => {
    const data = [[]];

    if (fields.length) {
        data[0] = fields;
        set.forEach(id => data.push(id));
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
                mergedEnter: this.getSetInfo('mergedEnter', getMergedSet(entrySet), filteredDataModel,
                    selectionSet._fields),
                mergedExit: this.getSetInfo('mergedExit', getMergedSet(exitSet), filteredDataModel,
                    selectionSet._fields),
                completeSet: this.getSetInfo('complete', completeSet, filteredDataModel, selectionSet._fields),
                fields: getSourceFields(propagationInf, payload.criteria)
            };

            return this;
        }
        return this._entryExitSet;
    }

    getSetInfo (type, set, filteredDataModel, setFields) {
        let model = null;
        const data = this.firebolt.data();

        if (type === 'mergedEnter') {
            model = filteredDataModel || null;
        } else if (type === 'mergedExit') {
            if (filteredDataModel) {
                const setKeys = new Set(set.map(d => d[0]));
                model = data.select((fields, i) => setKeys.has(setFields.map(field =>
                    (field === ReservedFields.ROW_ID ? i : fields[field].value))), {
                        saveChild: false
                    });
            }
            model = filteredDataModel || null;
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

            const { mergedEnter } = selectionSet.getSets(true);
            if (selectionSet.resetted() || criteria === null) {
                propData = null;
            } else if (isSimpleObject(criteria)) {
                const fields = isSimpleObject(criteria) ? Object.keys(criteria) : criteria[0];
                // const fields = Object.keys(criteria);
                const [dims, otherFields] =
                    partition(fields, (d => fieldsConfig[d].def.subtype === DimensionSubtype.CATEGORICAL));

                propData = {
                    fields: fields.map(d => fieldsConfig[d].def),
                    range: this.firebolt.getRangeFromIdentifiers({
                        criteria,
                        entrySet: mergedEnter,
                        fields: otherFields
                    }),
                    identifiers: getIdentifiersFromSet(mergedEnter, context, {
                        fields: dims,
                        fieldsConfig
                    })
                };
            } else {
                const data = criteria;
                propData = {
                    fields: data[0].map(d => (fieldsConfig[d] ? fieldsConfig[d].def : {
                        name: d
                    })),
                    identifiers: [criteria[0], ...mergedEnter]
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

