

/**
 *
 *
 * @param {*} context
 * @param {*} components
 * @param {*} layoutConfig
 * @param {*} measurement
 */
// export const renderComponents = (context, components, layoutConfig, measurement) => {
//     const {
//         headers,
//         legends
//     } = components;
//     const {
//         classPrefix
//     } = layoutConfig;
//     const {
//         title,
//         legend,
//         subtitle,
//         layout
//     } = getSkeletons(context.mount(), layoutConfig, measurement);
//     const {
//         mount
//     } = prepareGridContainer(layout.node(), measurement, classPrefix, context.alias());
//     const padding = context.layout().getViewInformation().layoutDimensions.viewWidth[0];
//     measurement.padding = padding;
//     setLabelRotationForAxes(context);

//     // // Render layout
//     // context.layout().renderGrid(mount);
//     // context.once('layer.drawn').then(() => {
//     //     renderHeader(layoutConfig, title, 'title', headers);
//     //     renderHeader(layoutConfig, subtitle, 'subtitle', headers);
//     //     renderLegend(layoutConfig, legend, legends, measurement);
//     //     shiftHeaders(layoutConfig, padding, measurement);
//     // });
//     // context.composition().visualGroup.matrixInstance().value.each((el) => {
//     //     el.valueOf().parentContainer(layout.node());
//     // });
// };
