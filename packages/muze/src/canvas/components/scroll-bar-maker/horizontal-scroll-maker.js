import { ScrollMaker } from './scroll-maker';
import { createScrollBarRect, createScrollBarArrow } from './helper';
import { HORIZONTAL } from '../../../constants';

export class HorizontalScrollMaker extends ScrollMaker {

    static type () {
        return HORIZONTAL;
    }
    createScroll (mountPoint, dimensions = this.logicalSpace()) {
        const config = this.config();
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

        rect.style('width', `${dimensions.width - height * 2}px`);
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

    emptyScrollAreaClick (event) {
        const {
            mover,
            rect
        } = this._components.moverRect;
        const speed = this.config().speed;
        const { x, y } = mover.node().getBoundingClientRect();
        const { x: rectX, y: rectY } = rect.node().getBoundingClientRect();
        let positionAdjuster = speed * 10;
        if (event.x < x) {
            positionAdjuster = -speed * 10;
        }
        this.changeMoverPosition({ x: x - rectX + positionAdjuster, y: y - rectY + positionAdjuster });
    }

    changeMoverPosition (newPosition) {
        let currentPos;
        const {
            mover,
            rect
        } = this._components.moverRect;
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
        const totalDistance = this._scrollBarWithouArrowLength - rectStartPos.x;
        const movedViewLength = (currentPos * totalLength) / totalDistance;

        this._attachedScrollAction(this.constructor.type(), movedViewLength);
    }

}

