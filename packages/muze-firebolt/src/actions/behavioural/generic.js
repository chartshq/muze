export default class GenericBehaviour {
    constructor (firebolt) {
        this.firebolt = firebolt;
    }

    dispatch () {
        return this;
    }

    static mutates () {
        return false;
    }
}

