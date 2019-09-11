import AnchorEffect from './anchors';
import { CLASSPREFIX } from '../enums/constants';
import { BRUSH_ANCHORS } from '../enums/side-effects';

export default class BrushAnchors extends AnchorEffect {
    static formalName () {
        return BRUSH_ANCHORS;
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
