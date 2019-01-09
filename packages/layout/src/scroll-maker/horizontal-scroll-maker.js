import { ScrollMaker } from './scroll-maker';
import { createScrollBarRect, createScrollBarArrow } from './helper';
import { HORIZONTAL } from '../enums/constants';

export class HorizontalScrollMaker extends ScrollMaker {

    static type () {
        return HORIZONTAL;
    }
    createScroll (mountPoint, config, dimensions) {
        const { scrollBarContainer } = super.createScroll(mountPoint, config, dimensions);
        const prevArrow = createScrollBarArrow(scrollBarContainer, 'left', config);
        const moverRect = createScrollBarRect(scrollBarContainer, config);
        const nextArrow = createScrollBarArrow(scrollBarContainer, 'right', config);
        const {
            mover,
            rect
        } = moverRect;

        rect.style('width', `${dimensions.width - 40}px`);
        rect.style('height', `${100}%`);
        mover.style('width', `${100}px`);
        mover.style('height', `${100}%`);
        mover.style('left', `${10}px`);

        this._components = {
            prevArrow,
            nextArrow,
            moverRect,
            scrollBarContainer
        };
    }

    changeMoverPosition (moverRect, newPosition) {
        const {
            mover,
            rect
        } = moverRect;
        const rectStartPos = rect.node().getBoundingClientRect();
        const moverPos = mover.node().getBoundingClientRect();

        if (newPosition.x < 0) {
            mover.style('left', `${0}px`);
        } else if (newPosition.x + moverPos.width > rectStartPos.width) {
            mover.style('left', `${rectStartPos.width - moverPos.width}px`);
        } else {
            mover.style('left', `${newPosition.x}px`);
        }
    }

}

