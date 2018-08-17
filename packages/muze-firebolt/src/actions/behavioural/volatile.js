import GenericBehaviour from './generic';

export default class VolatileBehaviour extends GenericBehaviour {
    getSelectionSet (payload, propagationInf) {
        const criteria = payload.criteria;
        const firebolt = this.firebolt;
        const formalName = this.constructor.formalName();

        const selectionSet = firebolt.select(criteria, formalName, {}, propagationInf);

        return selectionSet();
    }

    dispatch (payload, propagationInf) {
        return this.getSelectionSet(payload, propagationInf);
    }
}
