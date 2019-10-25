import { GenericSideEffect } from '@chartshq/muze-firebolt';
import { makeElement, getSymbol, selectElement } from 'muze-utils';
import { TextCell } from '@chartshq/visual-cell';
import { Marker } from '../../../enums/side-effects';
import { CLASSPREFIX, HORIZONTAL } from '../../../enums/constants';
import { LEGEND_MARKER_PROPS } from '../../../legend/defaults';
import './styles.scss';

const SYMBOL_PADDING = (Math.sqrt(3) * 3);
const AXIS_STROKE = 1;

const createTextCell = (className, labelManagerRef) => {
    const cell = new TextCell(
        {
            type: 'text',
            className: `${className}-text`
        }, {
            labelManager: labelManagerRef()
        }).config({ maxLines: 1 });
    cell._minTickDiff = { height: 0, width: 0 };

    return cell;
};
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
            const labelManager = firebolt.context.labelManager;
            const context = firebolt.context;
            const config = this.config();
            const axis = context.axis().source();

            const range = payload.criteria[0] ? axis.getScaleValue(payload.criteria[1]) : 0;

            const legendGradContainer = context.getDrawingContext().svgContainer;

            const { top, left } = legendGradContainer.node().getBoundingClientRect();

            debugger;

            const legendmarkerGroup = makeElement(legendGradContainer,
                                                'g',
                                                [1],
                                                `${config.classPrefix}-${config.className}-group`);
            const legendmarkerTextContainer = makeElement(selectElement('#chart'), 'div', [1], `${className}-text-container`);

            let x;
            let y;
            let rotateAngle;

            if (firebolt.context.config().align === HORIZONTAL) {
                x = range - (Math.sqrt(LEGEND_MARKER_PROPS.size / SYMBOL_PADDING)) + AXIS_STROKE;
                y = 5;
                rotateAngle = 180;
            } else {
                y = range + Math.sqrt(LEGEND_MARKER_PROPS.size / (2 * SYMBOL_PADDING)) - AXIS_STROKE;
                x = 5;
                rotateAngle = 90;
            }

            if (!this._markerElement) {
                this._markerElement = makeElement(legendmarkerGroup,
                                    'path', [{ value: null }], className, { enter: physicalAction });
            }

            this._textElement = createTextCell(className, labelManager);
            this._markerElement
                    .data([{ value: payload.criteria }])
                    .attr('transform', `translate(${x},${y}) rotate(${rotateAngle})`)
                    .attr('d', getSymbol('triangle').size(LEGEND_MARKER_PROPS.size * LEGEND_MARKER_PROPS.size)())
                    .classed(`${className}-show`, true)
                    .classed(`${className}-hide`, false);

            this._textElement.source(payload.criteria[1]);
            this._textElement.render(legendmarkerTextContainer.node());
            legendmarkerTextContainer.attr('style', ` top: ${top + y - 23}px; left:${x + left}px`).classed(`${className}-show`, true)
            .classed(`${className}-hide`, false);

            console.log(this._textElement.getLogicalSpace());
        } else {
            // this._markerElement
            //     .data([{ value: null }])
            //     .classed(`${className}-show`, false)
            //     .classed(`${className}-hide`, true);
        }
    }
}
