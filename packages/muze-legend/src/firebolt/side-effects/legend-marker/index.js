import { GenericSideEffect } from '@chartshq/muze-firebolt';
import { makeElement, getSymbol } from 'muze-utils';
import { Marker } from '../../../enums/side-effects';
import { CLASSPREFIX, HORIZONTAL } from '../../../enums/constants';
import { LEGEND_MARKER_PROPS } from '../../../legend/defaults';
import './styles.scss';

const SYMBOL_PADDING = (Math.sqrt(3) * 3);
const AXIS_STROKE = 1;
export default class LegendMarker extends GenericSideEffect {
    constructor (...params) {
        super(...params);
        this._markerElement = null;
    }

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

    apply (selectionSet, payload) {
        const className = `${this.config().classPrefix}-${this.config().className}`;
        if (payload.criteria && payload.criteria.length) {
            const physicalAction = function () {
            // Register physical action on marker gere
            };
            const firebolt = this.firebolt;
            const context = firebolt.context;
            const config = this.config();
            const axis = context.axis().source();

            const axisScale = axis.scale();
            const range = payload.criteria[0] ? axis.getScaleValue(payload.criteria[1]) : 0;

            const axisType = context.config().align === HORIZONTAL ? 'x' : 'y';

            const rangeShifter = axisScale.range()[axisType === 'x' ? 0 : 1];

            const legendGradContainer = context.getDrawingContext().svgContainer;

            const legendmarkerGroup = makeElement(legendGradContainer,
                                                'g',
                                                [1],
                                                `${config.classPrefix}-${config.className}-group`);

            let x;
            let y;
            let rotateAngle;

            if (firebolt.context.config().align === HORIZONTAL) {
                x = range - (Math.sqrt(LEGEND_MARKER_PROPS.size / SYMBOL_PADDING)) + AXIS_STROKE;
                y = 0;
                rotateAngle = 180;
            } else {
                y = range + Math.sqrt(LEGEND_MARKER_PROPS.size / (2 * SYMBOL_PADDING)) - AXIS_STROKE;
                x = 0;
                rotateAngle = 90;
            }

            if (!this._markerElement) {
                this._markerElement = makeElement(legendmarkerGroup,
                                    'path', [{ value: null }], className, { enter: physicalAction });
            }
            this._markerElement
                    .data([{ value: payload.criteria }])
                    .attr('transform', `translate(${x},${y}) rotate(${rotateAngle})`)
                    .attr('d', getSymbol('triangle').size(LEGEND_MARKER_PROPS.size * LEGEND_MARKER_PROPS.size)())
                    .classed(`${className}-show`, true)
                    .classed(`${className}-hide`, false);
        } else {
            this._markerElement
                .data([{ value: null }])
                .classed(`${className}-show`, false)
                .classed(`${className}-hide`, true);
        }
    }
}
