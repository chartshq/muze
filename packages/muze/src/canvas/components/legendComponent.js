import { makeElement, selectElement } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import {
     LEFT, RIGHT, VERTICAL, HORIZONTAL
} from '../../constants';

export default class LegendComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, params.config.measurement.legendSpace, 0);
        this.components = params.component;
        this.params = params;
        this.target(params.config.target);
        this.position(params.config.position);
        this.className(params.config.className);
        this.alignWith(params.config.alignWith);
        this.alignment(params.config.alignment);
    }

    renderLegend (container) {
        container = selectElement(container);
        const sectionComponents = [];
        const { legendSpace, height, width } = this.params.config.measurement;
        const { position, classPrefix } = this.params.config;
        const legendMount = makeElement(container, 'div', [this.components],
                                        `${classPrefix}-inner-content`, {}, d => d);
        legendMount.classed(`${classPrefix}-legend`, true);
        const align = (position === LEFT || position === RIGHT) ? VERTICAL : HORIZONTAL;
        const legWidth = align === VERTICAL ? legendSpace.width : width;
        const legHeight = align === VERTICAL ? height : legendSpace.height;

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
                            .each(function (d) { d.legend.mount(this); })
                            .style('width', d => `${d.legend.measurement().width}px`);
        }
    }

    draw (container) {
        this.renderLegend(container || document.getElementById(this.renderAt()));
    }

}
