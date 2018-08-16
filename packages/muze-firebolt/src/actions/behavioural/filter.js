import VolatileBehaviour from './volatile';
import { FILTER } from '../../enums/behaviours';

export default class FilterBehaviour extends VolatileBehaviour {
    static formalName () {
        return FILTER;
    }

    static mutates () {
        return true;
    }
}
