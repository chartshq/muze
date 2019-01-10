import { ScrollMaker } from './scroll-maker';
import { createScrollBarRect, createScrollBarArrow } from './helper';
import { HORIZONTAL } from '../../../constants';

export class HorizontalScrollMaker extends ScrollMaker {

    static type () {
        return HORIZONTAL;
    }
    createScroll (mountPoint, config, dimensions = this.logicalSpace()) {
        const { scrollBarContainer } = super.createScroll(mountPoint, config, dimensions);
        const prevArrow = createScrollBarArrow(scrollBarContainer, 'left', config);
        const moverRect = createScrollBarRect(scrollBarContainer, config);
        const nextArrow = createScrollBarArrow(scrollBarContainer, 'right', config);
        const {
            mover,
            rect
        } = moverRect;

        const { height, width, totalLength, viewLength } = this.logicalSpace();
        const scrollBarWithouArrowLength = width - height * 2;

        rect.style('width', `${dimensions.width - 40}px`);
        rect.style('height', `${100}%`);
        mover.style('width', `${(viewLength * scrollBarWithouArrowLength) / totalLength}px`);
        mover.style('height', `${100}%`);
        mover.style('left', `${0}px`);

        this._components = {
            prevArrow,
            nextArrow,
            moverRect,
            scrollBarContainer
        };
        this._scrollBarWithouArrowLength = scrollBarWithouArrowLength;
        this.registerListeners();
    }

    changeMoverPosition (moverRect, newPosition) {
        let currentPos;
        const {
            mover,
            rect
        } = moverRect;
        const rectStartPos = rect.node().getBoundingClientRect();
        const moverPos = mover.node().getBoundingClientRect();
        const {
            totalLength
         } = this.logicalSpace();

        if (newPosition.x < 0) {
            currentPos = 0;
        } else if (newPosition.x + moverPos.width > rectStartPos.width) {
            currentPos = rectStartPos.width - moverPos.width;
        } else {
            currentPos = newPosition.x;
        }

        mover.style('left', `${currentPos}px`);
        const totalDistance = this._scrollBarWithouArrowLength - moverPos.height;
        const movedViewLength = (currentPos * totalLength) / totalDistance;

        this._attachedScrollAction(this.constructor.type(), movedViewLength);
    }

}

