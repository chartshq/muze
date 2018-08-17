import { makeElement } from 'muze-utils';

import GenericSideEffect from './generic';

export default class SpawnableSideEffect extends GenericSideEffect {
    createElement (container, elemType, data, className) {
        return makeElement(container, elemType, data, className);
    }

    drawingContext (...drawingContext) {
        if (drawingContext.length) {
            this._drawingContext = drawingContext[0];
            return this;
        }
        return this._drawingContext;
    }

    show () {
        return this;
    }

    hide () {
        return this;
    }
}
