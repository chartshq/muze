import VolatileBehaviour from './volatile';
import * as BEHAVIOURNAMES from '../../enums/behaviours';

/**
 * This is the behaviour for brushing a region on the chart. It accepts a payload
 * which contains the x and y range of the data and other configuration. It will then
 * create a selection box from the range and select the points which fall within the range.
 */
export default class BrushBehaviour extends VolatileBehaviour {
    static formalName () {
        return BEHAVIOURNAMES.BRUSH;
    }
}
