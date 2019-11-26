import { VolatileBehaviour } from '@chartshq/muze-firebolt';
import { BRUSH } from '../../enums/behaviours';
/**
 * This is the behaviour for brushing a region on the chart. It accepts a payload
 * which contains the x and y range of the data and other configuration. It will then
 * create a selection box from the range and select the points which fall within the range.
 */
export default class UnitBrushBehaviour extends VolatileBehaviour {
    static formalName () {
        return BRUSH;
    }

    dispatch (...params) {
        this.active = params[0].dragging;
        this.start = params[0].dragStart;
        return super.dispatch(...params);
    }
}
