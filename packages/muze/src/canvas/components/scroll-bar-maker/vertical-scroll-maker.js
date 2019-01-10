import { ScrollMaker } from './scroll-maker';
import { createScrollBarRect, createScrollBarArrow } from './helper';
import { VERTICAL } from '../../../constants';

export class VerticalScrollMaker extends ScrollMaker {

    static type () {
        return VERTICAL;
    }

    createScroll (mountPoint, config, dimensions = this.logicalSpace()) {
        const { scrollBarContainer } = super.createScroll(mountPoint, config, dimensions);
        const prevArrow = createScrollBarArrow(scrollBarContainer, 'top', config);
        const moverRect = createScrollBarRect(scrollBarContainer, config);
        const nextArrow = createScrollBarArrow(scrollBarContainer, 'bottom', config);
        const {
            mover,
            rect
        } = moverRect;

        this.logicalSpace({
            height: dimensions.height,
            width: 100
        });

        rect.style('height', `${dimensions.height - 40}px`);
        rect.style('width', `${100}%`);
        mover.style('width', `${100}%`);
        mover.style('height', `${100}px`);
        mover.style('top', `${10}px`);

        this._components = {
            prevArrow,
            nextArrow,
            moverRect,
            scrollBarContainer
        };
        this.registerListeners();
    }

    changeMoverPosition (moverRect, newPosition) {
        const {
            mover,
            rect
        } = moverRect;
        const rectStartPos = rect.node().getBoundingClientRect();
        const moverPos = mover.node().getBoundingClientRect();

        if (newPosition.y < 0) {
            mover.style('top', `${0}px`);
        } else if (newPosition.y + moverPos.height > rectStartPos.height) {
            mover.style('top', `${rectStartPos.height - moverPos.height}px`);
        } else {
            mover.style('top', `${newPosition.y}px`);
        }
    }

}
