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

const pointTranslators = {
    polar: (data, encoding, layerInst) => {
        let points = [];
        const axes = layerInst.axes();
        const dataModel = layerInst.data();
        const fieldsConfig = dataModel.getFieldsConfig();
        const textEncoding = encoding.text;
        const { radius: radiusAxis, color: colorAxis, angle: angleAxis } = axes;
        const { field: textField, value, formatter: textFormatter } = textEncoding;
        const colorEncoding = encoding.color;
        const backgroundEncoding = encoding.text.background;
        const backgroundPadding = backgroundEncoding.padding;
        const backgroundValue = backgroundEncoding.value;
        const {
            colorFieldIndex
        } = layerInst.encodingFieldsInf();
        const textFieldIndex = textField ? fieldsConfig[textField] && fieldsConfig[textField].index : -1;
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const source = d._data;
            const textValue = textField ? source[textFieldIndex] : value;

            const { color, rawColor } = getLayerColor({ datum: { _data: source }, index: i },
                { colorEncoding, colorAxis, colorFieldIndex });
            const radiusVal = radiusAxis.getScaleValue(d.radius);
            const { startAngle, endAngle } = angleAxis.getScaleValue(d.angle);

            const angleV = (((startAngle + endAngle) / 2) * 180 / Math.PI);
            let rotateAngle = -90 + angleV;
            if (angleV > 180) {
                rotateAngle = angleV + 90;
            }
            const point = {
                enter: {},
                update: {
                    angleVal: (startAngle + endAngle) / 2 - (Math.PI / 2),
                    radiusVal
                },
                text: textFormatter(textValue, i, data, layerInst),
                color,
                rotate: `rotate(${rotateAngle})`,
                rotateAngle,
                background: {
                    value: backgroundValue instanceof Function ? backgroundValue(d, i, data, layerInst) : null,
                    padding: backgroundPadding
                },
                meta: {
                    stateColor: {},
                    originalColor: rawColor,
                    colorTransform: {}
                },
                style: {},
                source,
                rowId: d._id
            };

            point.className = getIndividualClassName(d, i, data, layerInst);
            points.push(point);
        }

        points = positionPoints(layerInst, points);
        const measurement = layerInst.measurement();
        for (let i = 0, len = points.length; i < len; i++) {
            const point = points[i];
            const { angleVal, radiusVal } = point.update;
            point.update.x = (radiusVal * Math.cos(angleVal)) + (measurement.width / 2);
            point.update.y = (radiusVal * Math.sin(angleVal)) + (measurement.height / 2);
            point.rotate = `rotate(${point.rotateAngle}, ${point.update.x}, ${point.update.y})`;
        }

        points = points.filter((d) => {
            const update = d.update;
            return !isNaN(update.x) && !isNaN(update.y);
        });
        return points;
    },
    cartesian: (data, encoding, layerInst) => {
        let points = [];
        const axes = layerInst.axes();
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
                text: textFormatter(textValue, i, data, this),
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
                source: d._data,
                rowId: d._id
            };

            point.className = getIndividualClassName(d, i, data, this);
            points.push(point);
        }

        points = positionPoints(this, points);
        points = points.filter((d) => {
            const update = d.update;
            return !isNaN(update.x) && !isNaN(update.y);
        });
        return points;
    }
};

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

    getPointTranslator (val) {
        return pointTranslators[val];
    }

    /**
     * Generates an array of objects containing x, y, width and height of the points from the data
     * @param  {Array.<Array>} data Data Array
     * @param  {Object} encoding  Config
     * @param  {Object} axes     Axes object
     * @return {Array.<Object>}  Array of points
     */
    translatePoints (data, encoding, axes) {
        return pointTranslators[this.coord()](data, encoding, axes, this);
    }

    /**
     * Renders the plot in the given container
     * @param  {SVGElement} container SVGElement which will hold the plot
     * @return {textLayer} Instance of text layer
     */
    render (container) {
        const config = this.config();
        const encoding = config.encoding;
        const normalizedData = this._normalizedData;
        const className = config.className;
        const qualifiedClassName = getQualifiedClassName(config.defClassName, this.id(), config.classPrefix);
        const containerSelection = selectElement(container);

        containerSelection.classed(`${qualifiedClassName.join(' ')} ${className}`, true);
        createElements({
            data: normalizedData,
            append: 'g',
            selector: 'g',
            container,
            each: (dataArr, group) => {
                const node = group.node();
                const points = this.translatePoints(dataArr, encoding, this);
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
