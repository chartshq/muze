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
        const anchorLayers = layers.filter(l => l.config().groupId === PERSISTENT_ANCHORS);
        anchorLayers.forEach((anchor) => {
            // Execute focusStroke interaction of anchor point layer
            const ids = anchor.data().getUids();
            const layerName = this.constructor.formalName();
            const defaultInteractionLayerEncoding = anchor.config().encoding.interaction;
            anchor.applyInteractionStyle(defaultInteractionLayerEncoding[layerName], ids, { apply: true });
        });
    }

    // offset value by which anchor size is changed
    // Applied only on select interaction
    getAnchorSizeonInteraction () {
        return 50;
    }

    getAnchorStroke () {
        return '2px';
    }
}
