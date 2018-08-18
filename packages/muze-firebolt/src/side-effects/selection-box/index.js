import {
    getQualifiedClassName,
    selectElement,
    makeElement
} from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';
import './styles.scss';
import SpawnableSideEffect from '../spawnable';
import { selectionBoxDrag } from '../../actions/physical/selection-box-drag';
import { getBoxDimensionsFromPayload, changeVisibility } from './helper';

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
            }
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
        let x;
        let y;
        let width;
        let height;
        const config = this._config;
        const boxConf = config.box;
        const firebolt = this.firebolt;
        const drawingInf = this.drawingContext()();
        const mountPoint = drawingInf.sideEffectGroup;
        const unitWidth = drawingInf.width;
        const unitHeight = drawingInf.height;
        const classPrefix = config.classPrefix;
        const xOffset = drawingInf.xOffset;
        const yOffset = drawingInf.yOffset;
        const selectionGroupClassName = config.defClassName;

        if (payload.criteria === null) {
            this.hide(drawingInf);
            return this;
        }

        const { dimension, direction } = getBoxDimensionsFromPayload(payload, this.sourceInf()());
        const transition = payload.dragEnd && config.transition;

        if (direction === 'both' || direction === 'vertical') {
            x = Math.min(dimension.x1, dimension.x2);
            width = Math.abs(dimension.x2 - dimension.x1);
        } else {
            x = 0;
            width = unitWidth;
        }
        if (direction === 'both' || direction === 'horizontal') {
            y = Math.min(dimension.y1, dimension.y2);
            height = Math.abs(dimension.y2 - dimension.y1);
        } else {
            height = unitHeight;
            y = 0;
        }
        this._direction = direction;

        if (direction === 'vertical') {
            x += xOffset;
        } else if (direction === 'horizontal') {
            y += yOffset;
        } else {
            x += xOffset;
            y += yOffset;
        }

        this._direction = direction;
        this.show(drawingInf);
        // Create the data array for drawing the rectangle
        const points = [
            {
                x,
                y,
                width,
                height,
                sourceUnit: payload.sourceUnit
            }
        ];
        // Create the container group for selection box.
        const selectionGroup = makeElement(selectElement(mountPoint), 'g', [1],
            `.${classPrefix}-${selectionGroupClassName}`);
        const sideEffect = this;
        const selection = selectionGroup.selectAll('rect').data(points);
        const selectionBox = selection.enter().append('rect')
                        .each(function () {
                            selectionBoxDrag(firebolt)(selectElement(this), ['brush'], sideEffect);
                        })
                        .merge(selection)
                        .each(function (attrs) {
                            let element = selectElement(this);
                            transition && (element = element.transition().duration(transition.duration));
                            for (const key in attrs) {
                                if ({}.hasOwnProperty.call(attrs, key)) {
                                    !isNaN(attrs[key]) && element.attr(key, attrs[key]);
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

