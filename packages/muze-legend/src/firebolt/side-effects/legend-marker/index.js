import { GenericSideEffect } from '@chartshq/muze-firebolt';
import { Marker } from '../../../enums/side-effects';

export default class LegendMarker extends GenericSideEffect {
    // constructor (...params) {
    //     super(...params);
    // }

    static formalName () {
        return Marker;
    }

    apply (selectionSet, payload, options = {}) {
        console.log('Marking');
    }
}
