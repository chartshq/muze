import {
    makeElement,
    selectElement,
    getUniqueId,
    getSmartComputedStyle,
    generateGetterSetters
} from 'muze-utils';
import { behaviouralActions } from '@chartshq/muze-firebolt';
import { LegendFireBolt } from '../firebolt/legend-firebolt';
import { actionBehaviourMap } from '../firebolt/action-behaviour-map';
import { physicalActions } from '../firebolt/physical';
import * as sideEffects from '../firebolt/side-effects';
import { behaviourEffectMap } from '../firebolt/behaviour-effect-map';
import { VALUE, PATH } from '../enums/constants';
import { PROPS } from './props';
import { DEFAULT_MEASUREMENT, DEFAULT_CONFIG } from './defaults';
import { getItemMeasures, titleCreator, computeItemSpaces } from './legend-helper';

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
        this._data = [];
        this._metaData = [];
        this._mount = null;
        this._fieldName = null;
        this._title = '';
        this._metaData = null;
        this._labelManager = dependencies.labelManager;
        this._cells = dependencies.cells;
        this._id = getUniqueId();
        this._measurement = Object.assign({}, this.constructor.defaultMeasurement());
        this._config = Object.assign({}, this.constructor.defaultConfig());

        generateGetterSetters(this, PROPS);
        this._computedStyle = getSmartComputedStyle(selectElement('body'),
            `${this.config().classPrefix}-legend-item-info`);
        this._firebolt = new LegendFireBolt(this, {
            behavioural: behaviouralActions,
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
     * @returns
     * @memberof SimpleLegend
     */
    static defaultConfig () {
        return DEFAULT_CONFIG;
    }

    /**
     *
     *
     * @static
     * @returns
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
     * @return
     * @memberof Legend
     */
    elemType () {
        return PATH;
    }

    /**
     *
     *
     * @return
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
     * @return
     * @memberof Legend
     */
    getLabelSpaces () {
        this._labelManager.setStyle(getSmartComputedStyle(selectElement('body'),
            `${this.config().classPrefix}-legend-item-info`));
        return getItemMeasures(this.data(), VALUE, this._labelManager);
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
            align,
        } = this.config();

        // Effective padding, margin and padding
        const effPadding = padding * 2;
        const effBorder = border * 2;
        const effMargin = margin * 2;

        this.data(this.dataFromScale(this.scale()));
        // Get space occupied by title
        const titleSpace = this.getTitleSpace();
        const titleHeight = titleSpace.height > 0 ? titleSpace.height * 1.25 : 0;
        const titleWidth = titleSpace.width;

        // Get space occupied by labels
        const labelSpaces = this.getLabelSpaces(effPadding, align);

        const {
            totalHeight, totalWidth, itemSpaces, shapeSpaces, maxItemSpaces, maxShapeWidth
        } = computeItemSpaces(this.config(),
        { effPadding, titleWidth, labelSpaces, titleHeight, maxWidth, maxHeight }, this.data());

        this.measurement({
            width: Math.max(totalWidth, width) + effMargin + effBorder,
            height: Math.max(totalHeight, height) + effMargin + effBorder,
            labelSpaces,
            shapeSpaces,
            itemSpaces,
            maxItemSpaces,
            maxShapeWidth,
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
        return this._labelManager.getOriSize(this.title() ? this.title() : '');
    }

    /**
     * Creates the title for the legend
     *
     * @param {DOM} container Container made for the title
     * @return {Selection} Title and it's node
     * @memberof Legend
     */
    renderTitle (container) {
        const { titleSpaces, border, padding } = this.measurement();

        return titleCreator(container, this.title(), {
            height: titleSpaces.height,
            border,
            padding
        }, this.config().classPrefix);
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
            classPrefix
        } = this.config();
        const {
           maxWidth,
           maxHeight,
           width,
           height,
           margin,
           border
       } = this.measurement();
        const legendContainer = makeElement(selectElement(this.mount()), 'div', [1], `${classPrefix}-legend-box`);

        legendContainer.classed(`${classPrefix}-legend-box-${this._id}`, true);
        legendContainer.style('float', 'left');
        // set height and width
        legendContainer.style('width', `${Math.min(maxWidth, width) - margin * 2}px`)
                        .style('height', `${Math.min(maxHeight, height) - margin * 2}px`)
                        .style('margin', `${margin}px`)
                        .style('border-width', `${border}px`);
        this.legendContainer(legendContainer.node());

        // create title
        this.renderTitle(legendContainer);
        firebolt.mapActionsAndBehaviour();
        firebolt.createSelectionSet(this.data().map(d => d.id));
        return legendContainer;
    }

    /**
     *
     *
     * @param {*} data
     * @returns
     * @memberof SimpleLegend
     */
    getCriteriaFromData (data) {
        const fieldName = this.fieldName();

        return [[fieldName], [data.value]];
    }
}
