import {
    makeElement,
    selectElement,
    getUniqueId,
    getSmartComputedStyle,
    generateGetterSetters,
    mergeRecursive
} from 'muze-utils';
import * as legendBehaviours from '../firebolt/behavioural';

import { LegendFireBolt } from '../firebolt/legend-firebolt';
import { actionBehaviourMap } from '../firebolt/action-behaviour-map';
import { physicalActions } from '../firebolt/physical';
import * as sideEffects from '../firebolt/side-effects';
import { behaviourEffectMap } from '../firebolt/behaviour-effect-map';
import { VALUE, PATH, RIGHT, LEFT, TOP, BOTTOM, POSITION_ALIGNMENT_MAP } from '../enums/constants';
import { PROPS } from './props';
import { DEFAULT_MEASUREMENT, DEFAULT_CONFIG, LEGEND_TITLE } from './defaults';
import {
    getItemMeasures,
    titleCreator,
    computeItemSpaces,
    prepareSelectionSetData,
    calculateTitleWidth
} from './legend-helper';

/**
 * Creates a Legend from the axes of a canvas
 *
 * @param {Object} dependencies : legend data
 * @class SimpleLegend
 */
export default class SimpleLegend {

    /**
     * Creates an instance of Legend.
     * @param {Object} dependencies Set of dependencies required by the legend
     * @memberof Legend
     */
    constructor (dependencies) {
        const { interactions } = dependencies.registry;
        this._data = [];
        this._metaData = [];
        this._mount = null;
        this._fieldName = null;
        this._title = Object.assign({}, LEGEND_TITLE);
        this._metaData = null;
        this._labelManager = dependencies.labelManager;
        this._cells = dependencies.cells;
        this._id = getUniqueId();
        this._measurement = Object.assign({}, this.constructor.defaultMeasurement());
        this._config = mergeRecursive({}, this.constructor.defaultConfig());

        const dist = dependencies.labelManager.getOriSize('w');
        this._minTickDistance = { width: dist.width * 3 / 4, height: dist.height / 2 };

        generateGetterSetters(this, PROPS);
        this._computedStyle = getSmartComputedStyle(selectElement('body'),
            `${this.config().classPrefix}-legend-item-info`);

        this._firebolt = new LegendFireBolt(this, {
            behavioural: Object.assign({}, interactions.behaviours.get(), legendBehaviours),
            physical: physicalActions,
            physicalBehaviouralMap: actionBehaviourMap
        }, sideEffects, behaviourEffectMap);
    }

    id () {
        return this._id;
    }
    /**
     * Initializes an instance of the class
     *
     * @static
     * @param {Object} dependencies Set of dependencies required by the legend
     * @return {Instance} returns a new instance of Legend
     * @memberof Legend
     */
    static create (dependencies) {
        return new SimpleLegend(dependencies);
    }

    /**
     *
     *
     * @static
     *
     * @memberof SimpleLegend
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

    /**
     *
     *
     * @static
     *
     * @memberof SimpleLegend
     */
    static defaultMeasurement () {
        return DEFAULT_MEASUREMENT;
    }

    /**
     *
     *
     * @readonly
     * @memberof SimpleLegend
     */
    firebolt (...params) {
        if (params.length) {
            return this;
        }
        return this._firebolt;
    }

    /**
     *
     *
     *
     * @memberof Legend
     */
    elemType () {
        return PATH;
    }

    canvasAlias (...alias) {
        if (alias.length) {
            this._canvasAlias = alias[0];
            return this;
        }
        return this._canvasAlias;
    }

    /**
     *
     *
     *
     * @memberof Legend
     */
    mount (...params) {
        if (params.length) {
            this._mount = params[0];
            this.render();
            return this;
        }
        return this._mount;
    }

    /**
     *
     *
     * @param {*} effPadding
     * @param {*} align
     *
     * @memberof Legend
     */
    getLabelSpaces () {
        const {
            item,
            classPrefix
        } = this.config();
        this._labelManager.setStyle(getSmartComputedStyle(selectElement('body'),
            `${classPrefix}-legend-item-info`));
        return getItemMeasures(this, VALUE, item.text.formatter);
    }

    /**
     * Sets the height and width of a legend based on provided max
     * height and width and based on its contents
     *
     * @return {Instance} Current instance
     * @memberof Legend
     */
    setLegendMeasures () {
        const {
            width,
            height,
            maxWidth,
            maxHeight,
            padding,
            margin,
            border
        } = this.measurement();
        const {
            align
        } = this.config();

        // Effective padding, margin and padding
        const effPadding = padding * 2;
        const effBorder = border * 2;
        const effMargin = margin * 2;

        this.data(this.dataFromScale());
        // Get space occupied by title
        const titleSpace = this.getTitleSpace();
        const titleHeight = titleSpace.height > 0 ? titleSpace.height + effPadding : 0;
        const titleWidth = titleSpace.width + effPadding;

        // Get space occupied by labels
        const labelSpaces = this.getLabelSpaces(effPadding, align);
        const {
            totalHeight, totalWidth, itemSpaces, iconSpaces, maxItemSpaces, maxIconWidth
        } = computeItemSpaces(this.config(),
        { effPadding, titleWidth, labelSpaces, titleHeight, maxWidth, maxHeight }, this.data());

        this.measurement({
            width: Math.max(totalWidth, width) + effMargin + effBorder,
            height: Math.max(totalHeight, height) + effMargin + effBorder,
            labelSpaces,
            iconSpaces,
            itemSpaces,
            maxItemSpaces,
            maxIconWidth,
            titleSpaces: {
                width: Math.min(maxWidth, this.measurement().width) - effMargin - effBorder,
                height: titleHeight
            }
        });
        return this;
    }

    /**
     * Returns the space occupied by the legend title
     *
     * @return {Object} Space occupied by title
     * @memberof Legend
     */
    getTitleSpace () {
        this._labelManager.setStyle(getSmartComputedStyle(selectElement('body'),
                                                `${this.config().classPrefix}-legend-title`));
        return this._labelManager.getOriSize(this.title().text ? this.title().text : '');
    }

    /**
     * Creates the title for the legend
     *
     * @param {DOM} container Container made for the title
     * @return {Selection} Title and it's node
     * @memberof Legend
     */
    renderTitle (container) {
        const { titleSpaces, border, padding, maxWidth } = this.measurement();

        const width = calculateTitleWidth(
            this.measurement(),
            this._labelManager.getOriSize(this._title.text).width,
            this.config()
        );
        const { borderStyle, borderColor } = this.config();
        return titleCreator(container, this.title(), {
            height: titleSpaces.height,
            width,
            maxWidth,
            border,
            padding,
            borderStyle,
            borderColor,
            alignment: POSITION_ALIGNMENT_MAP[this.config().position]
        }, this.config());
    }

    /**
     * Render the legend with its title
     *
     * @param {DOM} mountPoint Point where the legend and title are to be appended
     * @return {Instance} Current instance of legend
     * @memberof Legend
     */
    render () {
        const firebolt = this.firebolt();
        const {
            classPrefix,
            borderStyle,
            borderColor,
            position
        } = this.config();
        const {
            border,
            marginHorizontal,
            maxHeight,
            height,
            width,
            maxWidth
        } = this.measurement();
        let {
            margin
        } = this.measurement();
        const legendContainer = makeElement(selectElement(this.mount()), 'div', [1], `${classPrefix}-legend-box`);
        let marginPosition;
        switch (position) {
        case TOP:
            marginPosition = `margin-${BOTTOM}`;
            margin = marginHorizontal;
            break;
        case LEFT:
            marginPosition = `margin-${RIGHT}`;
            break;
        case BOTTOM:
            marginPosition = `margin-${TOP}`;
            margin = marginHorizontal;
            break;
        default:
            marginPosition = `margin-${LEFT}`;
        }
        legendContainer.classed(`${classPrefix}-legend-box-${this._id}`, true);
        legendContainer.style('float', 'left');

        const widthBox = calculateTitleWidth(
            this.measurement(),
            this._labelManager.getOriSize(this._title.text).width,
            this.config()
        );

        const titleWidth = Math.min(maxWidth, widthBox);
        width < titleWidth ? selectElement(this.mount()).style('width', `${titleWidth}px`) : null;
        // set height and width
        legendContainer.style('width', `${titleWidth}px`)
                        .style('height', `${Math.min(maxHeight, height)}px`)
                        .style(`${marginPosition}`, `${margin}px`)
                        .style('border', `${border}px ${borderStyle} ${borderColor}`);
        this.legendContainer(legendContainer.node());

        // create title
        this.renderTitle(legendContainer);
        firebolt.createSelectionSet(prepareSelectionSetData(this.data(), this.fieldName(), this.metaData()));
        return legendContainer;
    }

    /**
     *
     *
     * @param {*} data
     *
     * @memberof SimpleLegend
     */
    getCriteriaFromData (data) {
        const fieldName = this.fieldName();
        const type = this.metaData().getData().schema[0].type;
        if (type === 'measure') {
            return {
                [fieldName]: data.range
            };
        }
        return [[fieldName], [data.rawVal]];
    }

    getRangeFromIdentifiers ({ fields, entrySet }) {
        const data = this.data();
        const idRangeMap = data.reduce((acc, v) => {
            acc[v.id] = v;
            return acc;
        }, {});

        return fields.reduce((acc, v) => {
            acc[v] = entrySet.reduce((ranges, id) => {
                if (id in idRangeMap) {
                    ranges.push(idRangeMap[id].range);
                }
                return ranges;
            }, []);
            return acc;
        }, {});
    }

    setParentInfo (info) {
        this._canvasMount = info.canvasRoot;
    }
}
