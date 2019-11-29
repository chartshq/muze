import { makeElement, selectElement } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import {
     LEFT, RIGHT, VERTICAL, HORIZONTAL, TOP, BOTTOM, HORIZONTAL_CENTER, VERTICAL_CENTER
} from '../../constants';
import { ROW_MATRIX_INDEX, COLUMN_MATRIX_INDEX } from '../../../../layout/src/enums/constants';

function defaultAlignmentHelper (position) {
    let alignment = null;
    const alignWith = `${ROW_MATRIX_INDEX[1]}-${COLUMN_MATRIX_INDEX[1]}`;
    switch (position) {
    case TOP:
    case BOTTOM:
        alignment = HORIZONTAL_CENTER;
        break;
    case LEFT:
    case RIGHT:
        alignment = VERTICAL_CENTER;
        break;
    default:
        alignment = VERTICAL_CENTER;
    }
    return { alignment, alignWith };
}
export default class LegendComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, params.config.measurement.legendSpace, 0);
        this.setParams(params);
    }

    renderLegend (container) {
        container = selectElement(container);
        const sectionComponents = [];
        const { position, classPrefix } = this.params.config;
        const legendMount = makeElement(container, 'div', [this.components],
                                        `${classPrefix}-inner-content`, {}, d => d);
        legendMount.classed(`${classPrefix}-legend`, true);
        const align = (position === LEFT || position === RIGHT) ? VERTICAL : HORIZONTAL;
        const legWidth = this.newDimensions.width;
        const legHeight = this.newDimensions.height;

        [container, legendMount].forEach((elem) => {
            elem.style('width', `${Math.floor(legWidth)}px`)
                            .style('height', `${legHeight}px`)
                            .style('float', LEFT);
        });

        if (align === VERTICAL) {
            let sections = -1;
            let currHeight = legHeight;
            let currWidth = 0;

            this.components.forEach((legendInfo) => {
                const leg = legendInfo.legend;
                if (leg.measurement().height > currHeight) {
                    sections++;
                    currWidth = 0;
                    currHeight = legHeight;
                } else {
                    sections < 0 && sections++;
                }
                sectionComponents[sections] = sectionComponents[sections] || [];
                currHeight -= Math.min(leg.measurement().height, currHeight);
                currWidth = Math.max(Math.min(leg.measurement().width, leg.measurement().maxWidth), currWidth);
                sectionComponents[sections].push({
                    legend: leg,
                    legendHeight: legHeight,
                    legendWidth: currWidth
                });
            });

            const mount = makeElement(legendMount, ['div'], sectionComponents, `${classPrefix}-legend-section`);
            // mount.each((d, i) => selectElement(this).classed(`${classPrefix}-legend-section-${i}`, true));
            mount.classed(`${classPrefix}-legend-vertical-section`, true)
                            .style('width', d => `${d[0].legendWidth}px`);
            makeElement(mount, ['div'], d => d, `${classPrefix}-legend-components`, {}, d => d.legend.id())
                            .each(function (d) {
                                d.legend.mount(this);
                            })
                            .style('width', d => `${d.legendWidth}px`);
        } else {
            const mount = makeElement(legendMount, 'div', [1], `${classPrefix}-legend-section`);
            mount.classed(`${classPrefix}-legend-horizontal-section`, true);
            mount.classed(`${classPrefix}-legend-section-${0}`, true)
                            .style('width', `${legWidth}px`);

            makeElement(mount, 'div', this.components, `${classPrefix}-legend-components`, {}, d => d.legend.id())
                            .style('width', d => `${d.legend.measurement().width}px`)
                            .each(function (d) { d.legend.mount(this); });
        }
    }

    draw (container) {
        this.renderLegend(container || document.getElementById(this.renderAt()));
    }

    updateWrapper (params) {
        this.name(params.name);
        this.boundBox(params.config.measurement.legendSpace);
        this.setParams(params);
        return this;
    }

    setParams (params) {
        this.components = params.component;
        this.params = params;
        this.target(params.config.target);
        this.position(params.config.position);
        const { alignWith, alignment } = defaultAlignmentHelper(params.config.position);
        this.className(params.config.className);
        this.alignWith(params.config.alignWith || alignWith);
        this.alignment(params.config.alignment || alignment);
    }

    setComponentInfo (params) {
        const { rootNode } = params;
        this.components.forEach((legendInfo) => {
            const leg = legendInfo.legend;
            leg.setParentInfo({ canvasRoot: rootNode });
        });
    }

}
