import AnchorEffect from './anchors';
import { CLASSPREFIX } from '../enums/constants';

export default class BrushAnchors extends AnchorEffect {
    static formalName () {
        return 'brush-anchors';
    }

    static defaultConfig () {
        return {
            className: `${CLASSPREFIX}-brush-anchors`
        };
    }

    getTransitionConfig () {
        return {
            disabled: true
        };
    }
}
