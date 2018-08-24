import { makeElement, selectElement } from 'muze-utils';
import { VERTICAL, HORIZONTAL, TOP, LEFT, RIGHT, BOTTOM } from '../constants';

/**
 * Sets the rotation for all x axes if any axis has the rotation config set in the
 * entire view
 *
 * @param {Array} columns Column cells that contain the axes cells
 */
const setLabelRotationForAxes = (context) => {
    let rotation = 0;

    const xAxes = context.xAxes() || [];

    (() => {
        for (let i = 0; i < xAxes.length; i++) {
            for (let j = 0; j < xAxes[i].length; j++) {
                if (xAxes[i][j].config().labels.rotation !== 0) {
                    rotation = xAxes[i][j].config().labels.rotation;
                    return;
                }
            }
        }
    })();

    if (rotation) {
        xAxes.forEach((axes) => {
            axes.forEach((axis) => {
                axis.config({ labels: { rotation, smartTicks: false } });
            });
        });
    }
};

/**
 *
 *
 * @param {*} context
 * @param {*} mount
 * @returns
 */
const getSkeletons = (mount, layoutConfig, measurement) => {
    const {
        layoutArrangement,
        classPrefix
    } = layoutConfig;
    const {
        headers,
        legends
    } = layoutArrangement;
    const {
        canvasWidth,
        canvasHeight,
        mountSpace
    } = measurement;
    const container = selectElement(mount);
    const components = {};
    if (mountSpace.height && mountSpace.height < canvasHeight) {
        container.style('overflow-y', 'scroll');
    }
    if (mountSpace.width && mountSpace.width < canvasWidth) {
        container.style('overflow-x', 'scroll');
    }
    const mountPoint = makeElement(container, 'div', [1], `${classPrefix}-viz`)
       .style('width', `${canvasWidth}px`)
       .style('height', `${canvasHeight}px`);
    makeElement(mountPoint, 'div', headers, `${classPrefix}-container`, {}, d => d).sort(() => -1)
                    .style('width', `${canvasWidth}px`)
                    .each(function (type) {
                        components[type] = selectElement(this)
                            .classed(`${classPrefix}-${type}-container`, true);
                        if (type === 'group') {
                            makeElement(components[type], 'div', legends, `${classPrefix}-${type}-inner-container`,
                            {}, d => d).sort(() => -1)
                                            .each(function (layoutType) {
                                                components[layoutType] = selectElement(this)
                                                     .classed(`${classPrefix}-${layoutType}-container`, true);
                                            });
                        }
                    });

    return components;
};

/**
 *
 *
 * @param {*} context
 * @param {*} container
 * @param {*} legendComponents
 */
const renderLegend = (legendConfig, container, legendComponents, measurement) => {
    const sectionComponents = [];
    const { legendSpace, headerHeight, height, width } = measurement;
    const { legend, classPrefix } = legendConfig;
    const { position } = legend;
    const legendMount = makeElement(container, 'div', [1], `${classPrefix}-legend`);
    const align = (position === LEFT || position === RIGHT) ? VERTICAL : HORIZONTAL;
    const legWidth = align === VERTICAL ? legendSpace.width : width;
    const legHeight = align === VERTICAL ? height - headerHeight : legendSpace.height;

    [container, legendMount].forEach((elem) => {
        elem.style('width', `${legWidth}px`)
                        .style('height', `${legHeight}px`)
                        .style('float', LEFT);
    });

    if (align === VERTICAL) {
        let sections = -1;
        let currHeight = legHeight;
        let currWidth = 0;

        legendComponents.forEach((legendInfo) => {
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
            currWidth = Math.max(leg.measurement().width, currWidth);
            sectionComponents[sections].push({
                legend: leg,
                legendHeight: legHeight,
                legendWidth: currWidth
            });
        });

        const mount = makeElement(legendMount, ['div'], sectionComponents, `${classPrefix}-legend-section`)
                        .each((d, i) => selectElement(this).classed(`${classPrefix}-legend-section-${i}`, true))
                        .classed(`${classPrefix}-legend-vertical-section`, true)
                        .style('width', d => `${d[0].legendWidth}px`);
        makeElement(mount, ['div'], d => d, `${classPrefix}-legend-components`, {}, d => d.legend.id())
                        .each(function (d) {
                            d.legend.mount(this);
                        })
                        .style('width', d => `${d.legendWidth}px`);
    } else {
        const mount = makeElement(legendMount, 'div', [1], `${classPrefix}-legend-section`)
                        .classed(`${classPrefix}-legend-horizontal-section`, true)
                        .classed(`${classPrefix}-legend-section-${0}`, true)
                        .style('width', `${legWidth}px`);

        makeElement(mount, 'div', legendComponents, `${classPrefix}-legend-components`, {}, d => d.legend.id())
                        .each(function (d) { d.legend.mount(this); })
                        .style('width', d => `${d.legend.measurement().width}px`);
    }
};

/**
 *
 *
 * @param {*} context
 * @param {*} container
 * @param {*} type
 * @param {*} headers
 */
const renderHeader = (layoutConfig, container, type, headers) => {
    const headerCell = headers[`${type}Cell`];
    const config = layoutConfig[`${type}`];
    const { position, align, padding } = config;
    const cont = makeElement(container, 'div', [1], `${layoutConfig.classPrefix}-${type}-container`);

    headerCell && headerCell.render(cont.node());
    cont.style('width', `${100}%`);

    if (config && headerCell) {
        cont.style('float', LEFT)
                        .style('text-align', align)
                        .style(`padding-${position === TOP ? BOTTOM : TOP}`, `${padding}px`);
    }
};

/**
 *
 *
 * @param {*} context
 * @param {*} shifter
 */
const shiftHeaders = (config, shifter, measurement) => {
    const { classPrefix, title, subtitle, legend } = config;
    const { legendSpace } = measurement;
    const { position } = legend;

    shifter += position === LEFT ? legendSpace.width : 0;
    title && selectElement(`.${classPrefix}-title-container`)
                    .style('padding-left', title.align === LEFT ? `${shifter}px` : 0);
    subtitle && selectElement(`.${classPrefix}-subtitle-container`)
                    .style('padding-left', subtitle.align === LEFT ? `${shifter}px` : 0);
    selectElement(`.${classPrefix}-legend-horizontal-section`)
                    .style('padding-left', `${shifter}px`)
                    .selectAll(`.${classPrefix}-legend-body, .${classPrefix}-legend-title`)
                    .style('max-width', `${legendSpace.width - shifter}px`);
    selectElement(`.${classPrefix}-legend-vertical-section`)
                    .style('padding-left', null)
                    .selectAll(`.${classPrefix}-legend-body, .${classPrefix}-legend-title`)
                    .style('max-width', null);
};

/**
 *
 *
 * @param {*} mountPoint
 * @param {*} measurement
 * @param {*} classPrefix
 * @returns
 */
const prepareGridContainer = (mountPoint, measurement, classPrefix, alias) => {
    if (!mountPoint) {
        return this;
    }

    const {
        height,
        width
    } = measurement;
     // Create container for the layout
    const container = makeElement(selectElement(mountPoint), 'div', [1], `${classPrefix}-grid-layout`)
        .attr('id', `${classPrefix}-grid-layout-${alias}`)
        .style('height', `${height}px`)
        .style('width', `${width}px`);
    // Mount for matrices
    const mount = makeElement(container, 'div', [1], `${classPrefix}-layout-grid-container`)
        .attr('id', `${classPrefix}-layout-grid-container-${alias}`)
        .style('height', `${height}px`)
        .style('width', `${width}px`)
        .style('overflow-x', width > 300 ? 'none' : 'scroll')
        .style('overflow-y', height > 300 ? 'none' : 'scroll');

    return {
        mount,
        container
    };
};

/**
 *
 *
 * @param {*} context
 * @param {*} components
 * @param {*} layoutConfig
 * @param {*} measurement
 */
export const renderComponents = (context, components, layoutConfig, measurement) => {
    const {
        headers,
        legends
    } = components;
    const {
        classPrefix
    } = layoutConfig;
    const {
        title,
        legend,
        subtitle,
        layout
    } = getSkeletons(context.mount(), layoutConfig, measurement);
    const {
        mount
   } = prepareGridContainer(layout.node(), measurement, classPrefix, context.alias());
    const padding = context.layout().getViewInformation().layoutDimensions.viewWidth[0];
    measurement.padding = padding;
    setLabelRotationForAxes(context);

    // Render layout
    context.layout().renderGrid(mount);
    renderLegend(layoutConfig, legend, legends, measurement);
    renderHeader(layoutConfig, title, 'title', headers);
    renderHeader(layoutConfig, subtitle, 'subtitle', headers);

    shiftHeaders(layoutConfig, padding, measurement);
};
