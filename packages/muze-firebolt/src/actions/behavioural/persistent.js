import GenericBehaviour from './generic';

export default class PersistentBehaviour extends GenericBehaviour {
    getSelectionSet (payload, propagationInf) {
        const criteria = payload.criteria;
        const firebolt = this.firebolt;
        const formalName = this.constructor.formalName();
        const selectionSet = firebolt.select(criteria, formalName, {
            persist: propagationInf.persistent !== undefined ? propagationInf.persistent : true
        }, propagationInf);

        return selectionSet();
    }

    dispatch (payload, propagationInf) {
        return this.getSelectionSet(payload, propagationInf);
    }
}
