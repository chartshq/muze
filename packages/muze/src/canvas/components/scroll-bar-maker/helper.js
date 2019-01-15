import {
    selectElement,
    makeElement,
    getD3Drag,
    getEvent
} from 'muze-utils';
import './scroll-bar.scss';

const d3Drag = getD3Drag();

const arrowUnicodeMap = {
    left: '&#9664',
    right: '&#9654',
    top: '&#9650',
    bottom: '&#9660'
};
const arrowSizeMap = {
    left: 'width',
    right: 'width',
    top: 'height',
    bottom: 'height'
};

export const createScrollBarArrow = (mount, type, config) => {
    const {
        classPrefix,
        thickness
    } = config;
    const arrow = makeElement(mount, 'div', [type], `${classPrefix}-scroll-arrow-${type}`);
    arrow.classed(`${classPrefix}-scroll-arrow`, true);
    arrow.style(arrowSizeMap[type], `${thickness}px`);
    arrow.html(arrowUnicodeMap[type]);
    return arrow;
};

export const createScrollBarRect = (mount, config) => {
    const {
        classPrefix
    } = config;
    const rect = makeElement(mount, 'div', [1], `${classPrefix}-scroll-rect`);
    const mover = makeElement(rect, 'div', [1], `${classPrefix}-scroll-mover`);
    return { rect, mover };
};

export const applyRectClick = (scrollMaker, moverRect) => {
    const {
        rect
    } = moverRect;
    rect.on('click', () => {
        const event = getEvent();
        scrollMaker.emptyScrollAreaClick(event);
    });
};

const applyMoverDrag = (scrollMaker, moverRect) => {
    const {
        mover,
        rect
    } = moverRect;
    let moverStartPos = 0;
    const rectStartPos = rect.node().getBoundingClientRect();

    let startPos = {};

    let endPos = {};
    mover.on('click', () => {
        const event = getEvent();
        event.stopPropagation();
    });
    mover.call(d3Drag()
                    .on('start', () => {
                        const event = getEvent();
                        moverStartPos = mover.node().getBoundingClientRect();
                        startPos = {
                            x: event.x,
                            y: event.y
                        };
                    })
                    .on('drag', () => {
                        const event = getEvent();
                        endPos = {
                            x: event.x,
                            y: event.y
                        };
                        const distanceMoved = {
                            x: endPos.x - startPos.x,
                            y: endPos.y - startPos.y
                        };
                        const actualPosition = {
                            x: moverStartPos.x + distanceMoved.x - rectStartPos.x,
                            y: moverStartPos.y + distanceMoved.y - rectStartPos.y
                        };

                        scrollMaker.changeMoverPosition(actualPosition);
                    }));
};

export const registerListeners = (scrollMaker) => {
    const {
        prevArrow,
        moverRect,
        nextArrow
    } = scrollMaker._components;
    const {
        mover,
        rect
    } = moverRect;
    const speed = scrollMaker.config().speed;
    prevArrow.on('click', () => {
        const { x, y } = mover.node().getBoundingClientRect();
        const { x: rectX, y: rectY } = rect.node().getBoundingClientRect();

        scrollMaker.changeMoverPosition({ x: x - rectX - speed, y: y - rectY - speed });
    });
    applyMoverDrag(scrollMaker, moverRect);
    applyRectClick(scrollMaker, moverRect);
    nextArrow.on('click', () => {
        const { x, y } = mover.node().getBoundingClientRect();
        const { x: rectX, y: rectY } = rect.node().getBoundingClientRect();
        scrollMaker.changeMoverPosition({ x: x - rectX + speed, y: y - rectY + speed });
    });
};

export const scrollContainerHelper = (mountPoint, config, dimensions, type) => {
    const {
        classPrefix
    } = config;
    const scrollBarContainer = makeElement(selectElement(mountPoint), 'div', [1], `#${classPrefix}-scroll-bar-${type}`);
    scrollBarContainer.classed(`${classPrefix}-scroll-bar`, true);
    scrollBarContainer.style('width', `${dimensions.width}px`);
    scrollBarContainer.style('height', `${dimensions.height}px`);
    return scrollBarContainer;
};

