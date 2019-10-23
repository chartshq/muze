import { GenericSideEffect } from '@chartshq/muze-firebolt';
import { makeElement, getSymbol } from 'muze-utils';
import { Marker } from '../../../enums/side-effects';
import { CLASSPREFIX, HEIGHT, WIDTH, HORIZONTAL, RECT } from '../../../enums/constants';

export default class LegendMarker extends GenericSideEffect {
    // constructor (...params) {
    //     super(...params);
    // }

    static formalName () {
        return Marker;
    }

      /**
     * It returns the default configuration needed by legend-marker.
     * @return {Object} Default configuration of the legend-marker.
     */
    static defaultConfig () {
        return {
            className: 'legend-marker',
            classPrefix: CLASSPREFIX
        };
    }

    apply (selectionSet, payload, options = {}) {
        if (payload.criteria && payload.criteria.length) {
            let x;
            let y;

            const firebolt = this.firebolt;
            const context = firebolt.context;
            const config = this.config();
            const axis = context.axis().source();
            const className = `${config.classPrefix}-${config.className}`;

            const axisScale = axis.scale();
            const range = payload.criteria[0] ? axis.getScaleValue(payload.criteria[1]) : 0;

            const axisType = context.config().align === HORIZONTAL ? 'x' : 'y';

            const rangeShifter = axisScale.range()[axisType === 'x' ? 0 : 1];
            const legendGradContainer = context.getDrawingContext().svgContainer;
            const legendmarkerGroup = makeElement(legendGradContainer,
                                                'g',
                                                [1],
                                                `${config.classPrefix}-${config.className}-group`);

            if (firebolt.context.config().align === HORIZONTAL) {
                x = range - rangeShifter || 0;
                y = 0;
            // width = range[1] - range[0] || 0;
            // height = //TODO
            } else {
                y = range - rangeShifter || 0;
            // height = range[0] - range[1] || 0;
            // width = //TODO
            }
            const physicalAction = function () {
            // Register physical action on marker gere
            };
            // const marker = makeElement(legendmarkerGroup,
            //                         'path',
            //                         [{ value: payload.criteria, x, y }], className,
            //                         { enter: physicalAction });
            // debugger;
            // marker.attr('y', y).attr('x', x).attr('d', getSymbol('triangle').size(50)());

            const marker = makeElement(legendmarkerGroup,
                RECT,
                [{ value: payload.criteria, x, y }], className,
                { enter: physicalAction });
            debugger;
            marker.attr('y', y).attr('x', x).attr('width', 50).attr('height', 5);
        }
    }
}
