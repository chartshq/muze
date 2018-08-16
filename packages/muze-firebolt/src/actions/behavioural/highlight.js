import VolatileBehaviour from './volatile';
import { HIGHLIGHT } from '../../enums/behaviours';

export default class HighlightBehaviour extends VolatileBehaviour {
    static formalName () {
        return HIGHLIGHT;
    }
}
