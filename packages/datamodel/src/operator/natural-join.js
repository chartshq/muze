import { crossProduct } from './cross-product';
import { naturalJoinFilter } from './natural-join-filter-function';

export function naturalJoin (dataModel1, dataModel2) {
    return crossProduct(dataModel1, dataModel2, naturalJoinFilter(dataModel1, dataModel2), true);
}
