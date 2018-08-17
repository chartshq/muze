import AnchorEffect from './anchors';
import { CLASSPREFIX } from '../enums/constants';

export default class PersistentAnchors extends AnchorEffect {
    static formalName () {
        return 'persistent-anchors';
    }

    static defaultConfig () {
        return {
            className: `${CLASSPREFIX}-persistent-anchors`
        };
    }

    getTransitionConfig () {
        return {
            disabled: true
        };
    }
}
