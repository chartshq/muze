/* eslint no-useless-constructor: "off" */
import { DataParser } from './data-parser';

export class HTMLDataAdapter extends DataParser {
    constructor (data) {
        super(data);
    }

    getCoordinates () {
        return super.defaultDataPointLogic();
    }
}
