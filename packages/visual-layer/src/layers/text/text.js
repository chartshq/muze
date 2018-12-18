import {
    getQualifiedClassName,
    selectElement,
    setStyles,
    createElements
} from 'muze-utils';
import { BaseLayer } from '../../base-layer';
import drawText from './renderer';
import { defaultConfig } from './default-config';
import { getLayerColor, positionPoints, getIndividualClassName } from '../../helpers';
import { TEXT_ANCHOR_MIDDLE, ENCODING } from '../../enums/constants';

import './styles.scss';

/**
 * This layer is used to create labels for each data point. It has an encoding property ```text```
 * which determines from which field's data the value of the label will be taken. The text encoding
 * property is necessary for the layer to render the text.The mark type of this layer is ```text```.
 *
 * @public
 *
 * @class
 * @module TextLayer
 * @extends BaseLayer
 */
export default class TextLayer extends BaseLayer {
    /**
     * Returns the default configuration of the text layer
     * @return {Object} Default configuration of the text layer
     */
    static defaultConfig () {
        return defaultConfig;
    }

    static formalName () {
        return 'text';
    }

    elemType () {
        return 'text';
    }

    /**
     * Generates an array of objects containing x, y, width and height of the points from the data
     * @param  {Array.<Array>} data Data Array
     * @param  {Object} encoding  Config
     * @param  {Object} axes     Axes object
     * @return {Array.<Object>}  Array of points
     */
    translatePoints (data, encoding, axes) {
        let points = [];
        const colorAxis = axes.color;
        const textEncoding = encoding.text;
        const { field: textField, value, formatter: textFormatter } = textEncoding;
        const colorEncoding = encoding.color;
        const colorField = colorEncoding && colorEncoding.field;
        const fieldsConfig = this.data().getFieldsConfig();

        const backgroundEncoding = encoding.text.background;
        const backgroundPadding = backgroundEncoding.padding;
        const backgroundValue = backgroundEncoding.value;
        const colorFieldIndex = fieldsConfig[colorField] ? fieldsConfig[colorField].index : -1;
        const textFieldIndex = textField ? fieldsConfig[textField] && fieldsConfig[textField].index : -1;
        const xEnc = ENCODING.X;
        const yEnc = ENCODING.Y;
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const row = d._data;
            const textValue = textField ? row[textFieldIndex] : value;

            const [xPx, yPx] = [xEnc, yEnc].map(type => (axes[type] ? axes[type].getScaleValue(d[type]) +
                    axes[type].getUnitWidth() / 2 : 0));

            const { color, rawColor } = getLayerColor({ datum: d, index: i },
                { colorEncoding, colorAxis, colorFieldIndex });

            const point = {
                enter: {},
                update: {
                    x: xPx,
                    y: yPx
                },
                text: textFormatter ? textFormatter(textValue) : textValue,
                color,
                background: {
                    value: backgroundValue instanceof Function ? backgroundValue(d, i, data, this) : null,
                    padding: backgroundPadding
                },
                meta: {
                    stateColor: {},
                    originalColor: rawColor,
                    colorTransform: {}
                },
                style: {},
                _data: row,
                _id: d._id,
                source: d._data,
                rowId: d._id
            };

            if (d.x !== null && d.y !== null) {
                points.push(point);
            }

            point.className = getIndividualClassName(d, i, data, this);
        }

        points = positionPoints(this, points);

        return points;
    }

    /**
     * Renders the plot in the given container
     * @param  {SVGElement} container SVGElement which will hold the plot
     * @return {textLayer} Instance of text layer
     */
    render (container) {
        let points;
        const config = this.config();
        const encoding = config.encoding;
        const normalizedData = this._normalizedData;
        const className = config.className;
        const qualifiedClassName = getQualifiedClassName(config.defClassName, this.id(), config.classPrefix);
        const axes = this.axes();
        const containerSelection = selectElement(container);

        containerSelection.classed(`${qualifiedClassName.join(' ')} ${className}`, true);
        createElements({
            data: normalizedData,
            append: 'g',
            selector: 'g',
            container,
            each: (dataArr, group, i) => {
                const node = group.node();
                points = this.translatePoints(dataArr, encoding, axes, i);
                setStyles(node, {
                    'text-anchor': TEXT_ANCHOR_MIDDLE
                });
                drawText(node, points, {
                    className: qualifiedClassName[0]
                }, this._dependencies.smartLabel);
            }
        });
        return this;
    }
}
