import PersistentBehaviour from './persistent';
import { SELECT } from '../../enums/behaviours';

export default class SelectBehaviour extends PersistentBehaviour {
    static formalName () {
        return SELECT;
    }
}

