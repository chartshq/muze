import { VolatileBehaviour } from '@chartshq/muze-firebolt';
import { PSEUDO_SELECT } from '../../enums/behaviours';

export default class PseudoSelectBehaviour extends VolatileBehaviour {
    static formalName () {
        return PSEUDO_SELECT;
    }
}

