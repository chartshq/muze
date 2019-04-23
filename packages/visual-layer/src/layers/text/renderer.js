import {
    setAttrs,
    setStyles,
    selectElement,
    makeElement,
    getSmartComputedStyle
} from 'muze-utils';

/**
 * Draws svg text in the specified container.
 * @param {SVGElement} container Container where labels will be appended.
 * @param {Array.<Object>} data Data of the elements.
 * @return {Selection} d3 selection of the elements.
 */
const drawText = (container, data, config, layerInst) => {
    const selection = selectElement(container).selectAll('g').data(data);
    const { smartLabel } = layerInst._dependencies;
    const graphicElems = layerInst._graphicElems;

    const selectionMerge = selection.enter().append('g')
        .each(function (dataObj) {
            setAttrs(this, dataObj.enter);
        })
        .merge(selection);
    const style = getSmartComputedStyle(selectElement(container), config.className);
    const fontSize = parseInt(style.fontSize, 10);

    smartLabel.setStyle(style);
    selectionMerge.each(function (dataObj) {
        const element = selectElement(this);
        graphicElems[dataObj.rowId] = element;
        const { update, text, color, textanchor, style: textStyle } = dataObj;
        const background = dataObj.background;
        let backgroundVal;
        if (backgroundVal = background.value) {
            const backgroundPadding = background.padding;
            let diff;
            const { width, height } = smartLabel.getOriSize(dataObj.text);
            const backgroundEl = makeElement(element, 'rect', [1]);

            if (textanchor === 'end') {
                diff = width;
            } else if (textanchor === 'start') {
                diff = 0;
            } else {
                diff = width / 2;
            }

            setAttrs(backgroundEl.node(), {
                x: update.x - diff - backgroundPadding / 2,
                y: update.y - fontSize - backgroundPadding / 2,
                width: width + backgroundPadding,
                height: height + backgroundPadding
            });
            background && setStyles(backgroundEl, {
                background: backgroundVal
            });
        }
        const textEl = makeElement(element, 'text', d => [d]).text(text);
        const textNode = textEl.node();
        textStyle && setStyles(textNode, textStyle);
        color && setStyles(textNode, {
            fill: color
        });
        dataObj.className && textEl.classed(dataObj.className, true);
        setAttrs(textNode, update);
        textEl.attr('text-anchor', textanchor);
        textEl.attr('alignment-baseline', dataObj['alignment-baseline']);
        textEl.attr('transform', `rotate(${dataObj.rotation} ${update.x} ${update.y})`);
    });
    selection.exit().remove();
    return selection;
};

export default drawText;
