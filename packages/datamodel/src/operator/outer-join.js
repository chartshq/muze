import { crossProduct } from './cross-product';
import { JOINS } from '../constants';
import { union } from './union';


export function leftOuterJoin (dataModel1, dataModel2, filterFn) {
    return crossProduct(dataModel1, dataModel2, filterFn, false, JOINS.LEFTOUTER);
}

export function rightOuterJoin (dataModel1, dataModel2, filterFn) {
    return crossProduct(dataModel2, dataModel1, filterFn, false, JOINS.RIGHTOUTER);
}

export function fullOuterJoin (dataModel1, dataModel2, filterFn) {
    return union(leftOuterJoin(dataModel1, dataModel2, filterFn), rightOuterJoin(dataModel1, dataModel2, filterFn));
}
