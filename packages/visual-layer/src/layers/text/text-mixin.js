import {
    getQualifiedClassName,
    selectElement,
    setStyles,
    createElements
} from 'muze-utils';
import drawText from './renderer';
import { defaultConfig } from './default-config';
import {
    positionPoints,
    getIndividualClassName,
    resolveEncodingValues,
    getColorMetaInf,
    toCartesianCoordinates,
    getDataFromEvent
} from '../../helpers';
import { TEXT_ANCHOR_MIDDLE, ENCODING } from '../../enums/constants';

import './styles.scss';

const defaultEncoding = defaultConfig.encoding;
const alignmentBaseLine = defaultEncoding['alignment-baseline'].value;
const defRotation = defaultEncoding.rotation.value;

const pointTranslators = {
    polar: (data, config, layerInst) => {
        let points = [];
        const axes = layerInst.axes();
        const encoding = layerInst.config().encoding;
        const textEncoding = encoding.text;
        const { radius: radiusAxis, color: colorAxis, angle: angleAxis } = axes;
        const { formatter: textFormatter } = textEncoding;
        const backgroundEncoding = encoding.text.background;
        const backgroundPadding = backgroundEncoding.padding;
        const backgroundValue = backgroundEncoding.value;
        const angleV = {};
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const source = d.source;
            const text = d.text;

            const color = colorAxis.getColor(d.color);
            const radius = radiusAxis.getOuterRadius(d.radius);
            const angles = angleAxis.getScaleValue(d.angle);
            !angleV[d.angle] && (angleV[d.angle] = 0);
            const { startAngle, endAngle } = angles[angleV[d.angle]++];

            const angle = (startAngle + endAngle) / 2;
            const resolvedVal = resolveEncodingValues({
                values: {
                    angle,
                    radius,
                    color,
                    text,
                    startAngle,
                    endAngle,
                    rotation: defRotation,
                    'alignment-baseline': alignmentBaseLine
                },
                data: d
            }, i, data, layerInst);
            const point = {
                enter: {},
                update: {
                    angle: resolvedVal.angle,
                    radius: resolvedVal.radius
                },
                text: textFormatter ? textFormatter(text, i, data, layerInst) : resolvedVal.text,
                color: resolvedVal.color,
                rotation: resolvedVal.rotation,
                background: {
                    value: backgroundValue instanceof Function ? backgroundValue(d, i, data, layerInst) : null,
                    padding: backgroundPadding
                },
                'alignment-baseline': resolvedVal['alignment-baseline'],
                meta: { ...{ layerId: layerInst.id() },
                    ...getColorMetaInf({
                        fill: resolvedVal.color
                    }) },
                style: {},
                source,
                rowId: d.rowId
            };

            point.className = getIndividualClassName(d, i, data, layerInst);
            points.push(point);
        }

        points = toCartesianCoordinates(positionPoints(layerInst, points), layerInst.measurement());

        points = points.filter((d) => {
            const update = d.update;
            return !isNaN(update.x) && !isNaN(update.y);
        });
        return points;
    },
    cartesian: (data, config, layerInst) => {
        let points = [];
        const axes = layerInst.axes();
        const colorAxis = axes.color;
        const encoding = layerInst.config().encoding;
        const textEncoding = encoding.text;
        const { field: textField, value, formatter: textFormatter } = textEncoding;
        const fieldsConfig = layerInst.data().getFieldsConfig();

        const backgroundEncoding = encoding.text.background;
        const backgroundPadding = backgroundEncoding.padding;
        const backgroundValue = backgroundEncoding.value;
        const textFieldIndex = textField ? fieldsConfig[textField] && fieldsConfig[textField].index : -1;
        const xEnc = ENCODING.X;
        const yEnc = ENCODING.Y;
        for (let i = 0, len = data.length; i < len; i++) {
            const d = data[i];
            const row = d.source;
            const textValue = textField ? row[textFieldIndex] : value;

            const [xPx, yPx] = [xEnc, yEnc].map(type => (axes[type] ? axes[type].getScaleValue(d[type]) +
                    axes[type].getUnitWidth() / 2 : 0));

            const color = colorAxis.getColor(d.color, colorAxis);
            const resolvedEncodings = resolveEncodingValues({
                values: {
                    x: xPx,
                    y: yPx,
                    text: textValue,
                    color,
                    rotation: defRotation,
                    'alignment-baseline': alignmentBaseLine
                },
                data: d
            }, i, data, layerInst);
            const point = {
                enter: {},
                update: {
                    x: resolvedEncodings.x,
                    y: resolvedEncodings.y
                },
                text: textFormatter(resolvedEncodings.text, i, data, layerInst),
                color: resolvedEncodings.color,
                background: {
                    value: backgroundValue instanceof Function ? backgroundValue(d, i, data, layerInst) : null,
                    padding: backgroundPadding
                },
                'alignment-baseline': resolvedEncodings['alignment-baseline'],
                rotation: resolvedEncodings.rotation,
                meta: { ...{ layerId: layerInst.id() },
                    ...getColorMetaInf({
                        fill: resolvedEncodings.color
                    }) },
                style: {},
                source: d.source,
                rowId: d.rowId
            };

            point.className = getIndividualClassName(d, i, data, layerInst);
            points.push(point);
        }

        points = positionPoints(layerInst, points);
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
export const TextLayerMixin = superclass => class extends superclass {
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
    translatePoints (data, config = {}) {
        return pointTranslators[this.coord()](data, config, this);
    }

    /**
    * Renders the plot in the given container
    * @param  {SVGElement} container SVGElement which will hold the plot
    * @return {textLayer} Instance of text layer
    */
    render (container) {
        const config = this.config();
        const normalizedData = this._normalizedData;
        const className = config.className;
        const qualifiedClassName = getQualifiedClassName(config.defClassName, this.id(), config.classPrefix);
        const containerSelection = selectElement(container);

        containerSelection.classed(`${qualifiedClassName.join(' ')} ${className}`, true);
        this._graphicElems = {};

        createElements({
            data: normalizedData,
            append: 'g',
            selector: 'g',
            container,
            each: (dataArr, group) => {
                const node = group.node();
                const points = this.translatePoints(dataArr, {}, this);
                setStyles(node, {
                    'text-anchor': TEXT_ANCHOR_MIDDLE
                });
                drawText(node, points, {
                    className: qualifiedClassName[0]
                }, this);
            }
        });
        return this;
    }

    getNearestPoint (x, y, { event }) {
        if (!this.data()) {
            return null;
        }
        return this.getDataFromEvent(event);
    }

    getDataFromEvent (event) {
        return getDataFromEvent(this, event);
    }
};

