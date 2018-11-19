import { DataParser } from './data-parser';

export class HTMLDataAdapter extends DataParser {
    getCoordinates () {
        return super.defaultDataPointLogic();
    }
}
