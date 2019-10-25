import AnchorEffect from './anchors';
import { CLASSPREFIX } from '../enums/constants';
import { PERSISTENT_ANCHORS } from '../enums/side-effects';

export default class PersistentAnchors extends AnchorEffect {
    static formalName () {
        return PERSISTENT_ANCHORS;
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

    setAnchorLayerStyle (layers) {
        const anchorLayer = layers.filter(l => l.config().groupId === PERSISTENT_ANCHORS)[0];
        if (anchorLayer) {
            // Execute focusStroke interaction of anchor point layer
            const ids = anchorLayer.data().getUids();
            const layerName = this.constructor.formalName();
            const defaultInteractionLayerEncoding = anchorLayer.config().encoding.interaction;
            anchorLayer.applyInteractionStyle(defaultInteractionLayerEncoding[layerName], ids, true);
        }
    }

    // offset value by which anchor size is changed
    // Applied only on select interaction
    getAnchorSizeonInteraction () {
        return 50;
    }
}
