import {
    selectElement,
    makeElement,
    getD3Drag,
    getEvent,
    getWindow,
    hasTouch
} from 'muze-utils';
import './scroll-bar.scss';
import { WIDTH, HEIGHT } from '../../../constants';

const d3Drag = getD3Drag();

const arrowSizeMap = {
    left: WIDTH,
    right: WIDTH,
    top: HEIGHT,
    bottom: HEIGHT
};

export const getUnitPositions = (unitMeasures, totalLength, viewLength) => {
    let currentLen = 0;
    const measures = unitMeasures.primary && unitMeasures.primary.length ?
        unitMeasures.primary : unitMeasures.secondary;

    return measures.map((e) => {
        const unitPosition = currentLen * 100 / (totalLength - viewLength);
        currentLen += e;
        return unitPosition;
    });
};

export const createScrollBarArrow = (mount, type, config) => {
    const {
        classPrefix,
        thickness
    } = config;
    const arrow = makeElement(mount, 'div', [type], `${classPrefix}-scroll-arrow-${type}`);

    arrow.classed(`${classPrefix}-scroll-arrow`, true);
    arrow.style(arrowSizeMap[type], `${thickness}px`);

    const chevron = makeElement(arrow, 'div', [1], `${classPrefix}-scroll-arrow-chevron`);

    chevron.attr('id', `${classPrefix}-scroll-arrow-chevron-${type}`);

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
    let startPos = {};
    let moverStartPos = 0;
    let rectStartPos = 0;
    let endPos = {};
    const {
        mover,
        rect
    } = moverRect;

    mover.call(d3Drag()
                    .on('start', () => {
                        const event = getEvent();

                        moverStartPos = mover.node().getBoundingClientRect();
                        rectStartPos = rect.node().getBoundingClientRect();
                        startPos = {
                            x: event.x,
                            y: event.y
                        };
                    })
                    .on('drag', () => {
                        const event = getEvent();
                        const window = getWindow();

                        endPos = {
                            x: event.x,
                            y: event.y
                        };
                        const distanceMoved = {
                            x: endPos.x - startPos.x,
                            y: endPos.y - startPos.y
                        };
                        const actualPosition = {
                            x: moverStartPos.x + distanceMoved.x - rectStartPos.x + window.pageXOffset,
                            y: moverStartPos.y + distanceMoved.y - rectStartPos.y + window.pageYOffset
                        };

                        scrollMaker.changeMoverPosition(actualPosition);
                    }));
};

const applyScrollMouseDownAction = (moverRect, scrollMaker, speed) => {
    const {
        mover,
        rect
    } = moverRect;
    const { x, y } = mover.node().getBoundingClientRect();
    const { x: rectX, y: rectY } = rect.node().getBoundingClientRect();

    scrollMaker.changeMoverPosition({ x: x - rectX + speed, y: y - rectY + speed });
};

const registerListenerOnArrow = (scrollMaker, moverRect, arrowType, speed) => {
    let timer = '';
    const arrow = scrollMaker._components[arrowType];
    const isTouchDevice = hasTouch();

    arrow.on(isTouchDevice ? 'touchstart' : 'mousedown', () => {
        const event = getEvent();

        event.preventDefault();

        timer = setInterval(() => {
            applyScrollMouseDownAction(moverRect, scrollMaker, speed);
        }, 100);
    }).on(isTouchDevice ? 'touchend' : 'mouseup', () => {
        const event = getEvent();

        event.preventDefault();

        clearInterval(timer);
    }).on('click', () => {
        applyScrollMouseDownAction(moverRect, scrollMaker, speed);
    });
};

export const registerListeners = (scrollMaker) => {
    const {
        moverRect
    } = scrollMaker._components;

    const speed = scrollMaker.config().speed;

    registerListenerOnArrow(scrollMaker, moverRect, 'prevArrow', -speed);
    applyMoverDrag(scrollMaker, moverRect);
    applyRectClick(scrollMaker, moverRect);
    registerListenerOnArrow(scrollMaker, moverRect, 'nextArrow', speed);
};

export const scrollContainerHelper = (mountPoint, config, dimensions, type) => {
    const {
        classPrefix
    } = config;
    const scrollBarContainer = makeElement(selectElement(mountPoint), 'div', [1], `#${classPrefix}-scroll-bar-${type}`);

    scrollBarContainer.classed(`${classPrefix}-scroll-bar`, true);
    scrollBarContainer.style(WIDTH, `${dimensions.width}px`);
    scrollBarContainer.style(HEIGHT, `${dimensions.height}px`);
    return scrollBarContainer;
};

