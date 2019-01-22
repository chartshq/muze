import { ScrollMaker } from './scroll-maker';
import { createScrollBarRect, createScrollBarArrow, getUnitPositions } from './helper';
import { HORIZONTAL, HEIGHT, WIDTH, LEFT } from '../../../constants';

export class HorizontalScrollMaker extends ScrollMaker {

    /**
     * Describes the type of the ScrollMaker
     *
     * @public
     *
     * @return {String} Returns the type of scroll maker: horizontal
     */
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

        const { height, width, totalLength, viewLength, unitWidths } = this.logicalSpace();
        const scrollBarWithouArrowLength = width - height * 2;

        rect.style(WIDTH, `${dimensions.width - height * 2}px`);
        rect.style(HEIGHT, `${100}%`);
        mover.style(WIDTH, `${(viewLength * scrollBarWithouArrowLength) / totalLength}px`);
        mover.style(HEIGHT, `${100}%`);
        mover.style(LEFT, `${0}px`);

        this._components = {
            prevArrow,
            nextArrow,
            moverRect,
            scrollBarContainer
        };
        this._scrollBarWithouArrowLength = scrollBarWithouArrowLength;
        this.unitPositions(getUnitPositions(unitWidths, totalLength, viewLength));
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

        mover.style(LEFT, `${currentPos}px`);
        const totalDistance = this._scrollBarWithouArrowLength;
        const movedViewLength = (currentPos * totalLength) / totalDistance;

        this.manager().performAttachedScrollFunction(this.constructor.type(), movedViewLength);
    }

    scrollDeltaTo (delta) {
        const {
            mover,
            rect
        } = this._components.moverRect;
        const moverPos = mover.node().getBoundingClientRect();
        const rectStartPos = rect.node().getBoundingClientRect();

        this.changeMoverPosition({ y: 0, x: moverPos.x - rectStartPos.x - delta });
        return this;
    }

    /**
     * Scrolls to the specific point in the page. The input is provided as a percentage (0 - 100)
     *
     * @public
     *
     * @param {number} scrollPercentage Its the percentage based on which the scroll action will occur
     * @return {HorizontalScrollMaker} Instance of the HorizontalScrollMaker
     */
    scrollTo (scrollPercentage) {
        const {
            mover
        } = this._components.moverRect;
        const moverPos = mover.node().getBoundingClientRect();
        const movement = (scrollPercentage * (this._scrollBarWithouArrowLength - moverPos.width)) / 100;

        this.changeMoverPosition({ y: 0, x: movement });
        return this;
    }

}

