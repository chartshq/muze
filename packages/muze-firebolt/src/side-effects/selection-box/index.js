import {
    getQualifiedClassName,
    selectElement,
    makeElement,
    isValidValue
} from 'muze-utils';
import { SELECTIONDRAG } from '../../enums/actions';
import { CLASSPREFIX } from '../../enums/constants';
import './styles.scss';
import SpawnableSideEffect from '../spawnable';
import { selectionBoxDrag } from '../../actions/physical/selection-box-drag';
import { getBoxDimensionsFromPayload, changeVisibility } from './helper';
import { BEHAVIOURS } from '../..';

/**
 * This class is used to create a selection box which is used by visual unit for brushing and
 * selection in the canvas.
 * @class SelectionBox
 */
class SelectionBox extends SpawnableSideEffect {
    /**
     * It returns the default configuration needed by selectionbox.
     * @return {Object} Default configuration of the selection box.
     */
    static defaultConfig () {
        return {
            defClassName: 'selection-box-group',
            className: '',
            classPrefix: CLASSPREFIX,
            box: {
                defClassName: 'selection-box',
                className: ''
            },
            transition: {
                duration: 200
            },
            persistent: false
        };
    }

    static formalName () {
        return 'selectionBox';
    }

    /**
     * Draws the selectionbox with the specified dimensions.
     * @param {Object} dimension Dimensions of the selection box.
     * @param {number} dimension.x1 Starting x position
     * @param {number} dimension.x2 Ending x position
     * @param {number} dimension.y1 Starting y position
     * @param {number} dimension.y2 Ending y position
     * @param {Object} conf Configuration needed to draw the selection box
     * @param {number} unitWidth Width of the visual unit.
     * @param {number} unitHeight Height of the visual unit.
     */
    apply (selectionSet, payload) {
        let x = 0;
        let y = 0;
        let width;
        let height;
        const config = this._config;
        const boxConf = config.box;
        const firebolt = this.firebolt;
        const drawingInf = this.drawingContext();
        const mountPoint = drawingInf.sideEffectGroup;
        const unitWidth = drawingInf.width;
        const unitHeight = drawingInf.height;
        const classPrefix = config.classPrefix;
        const selectionGroupClassName = config.defClassName;

        width = unitWidth;
        height = unitHeight;

        // Hide selection-box on dragEnd or when criteria is empty
        if (!payload.criteria || (payload.hideSelBox && !config.persistent)) {
            this.hide(drawingInf);
            return this;
        }

        const sourceInf = this.sourceInfo();
        const { dimension, direction } =
            getBoxDimensionsFromPayload(payload, sourceInf.axes, sourceInf.fields);
        const transition = payload.dragEnd && config.transition;

        if (direction === 'both') {
            x = Math.min(dimension.x1, dimension.x2);
            y = Math.min(dimension.y1, dimension.y2);
            width = Math.abs(dimension.x2 - dimension.x1);
            height = Math.abs(dimension.y2 - dimension.y1);
        }

        this.show(drawingInf);
        // Create the data array for drawing the rectangle
        const points = [
            {
                x,
                y,
                width,
                height
            }
        ];
        // Create the container group for selection box.
        const selectionGroup = makeElement(selectElement(mountPoint), 'g', [1],
            `.${classPrefix}-${selectionGroupClassName}`);
        const sideEffect = this;
        const selection = selectionGroup.selectAll('rect').data(points);
        const selectionBox = selection.enter().append('rect')
                        .each(function () {
                            // Add selectiondrag entry in firebolt._actionBehaviourMap
                            firebolt.registerPhysicalBehaviouralMap({
                                [SELECTIONDRAG]: {
                                    target: [selectElement(this)],
                                    behaviours: [BEHAVIOURS.BRUSH]
                                }
                            });
                            selectionBoxDrag(firebolt)(selectElement(this), ['brush'], sideEffect);
                        })
                        .merge(selection)
                        .each(function (attrs) {
                            let element = selectElement(this);
                            transition && (element = element.transition().duration(transition.duration));
                            for (const key in attrs) {
                                if ({}.hasOwnProperty.call(attrs, key)) {
                                    isValidValue(attrs[key]) && element.attr(key, attrs[key]);
                                }
                            }
                        });
        // Get the qualified class name for selection box rectangle
        const boxClassName = getQualifiedClassName(boxConf.defClassName, this._id, classPrefix);
        selectionBox.classed(boxClassName.join(' '), true);
        selectionBox.classed(boxConf.className, true);

        return this;
    }

    hide (drawingInf) {
        changeVisibility(this, drawingInf.sideEffectGroup, false);
    }

    show (drawingInf) {
        changeVisibility(this, drawingInf.sideEffectGroup, true);
    }
}

export default SelectionBox;
