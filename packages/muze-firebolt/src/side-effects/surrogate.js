import GenericSideEffect from './generic';

export default class SurrogateSideEffect extends GenericSideEffect {
    applyInteractionStyle (set, config = {}, interactionType, apply) {
        const layers = this.firebolt.context.layers();
        layers.forEach(layer => layer.config().interactive !== false &&
            layer.applyInteractionStyle(interactionType, set.uids, apply));
    }
}
