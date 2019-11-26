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

    setAnchorLayerStyle (layers) {
        const anchorLayers = layers.filter(l => l.config().groupId === BRUSH_ANCHORS);
        anchorLayers.forEach((anchor) => {
            // Execute focusStroke interaction of anchor point layer
            const ids = anchor.data().getUids();
            const layerName = this.constructor.formalName();
            const defaultInteractionLayerEncoding = anchor.config().encoding.interaction;
            anchor.applyInteractionStyle(defaultInteractionLayerEncoding[layerName], ids, { apply: true });
        });
    }

    getAnchorStroke (payload) {
        return payload.dragEnd ? '2px' : '1px';
    }
}
