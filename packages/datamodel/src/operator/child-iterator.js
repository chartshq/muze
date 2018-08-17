/* eslint-disable default-case */
import { DM_DERIVATIVES } from '../constants';

/**
 * iterate the children and call the callback for each
 *
 * @param {DataModel} datamodel
 * @param {function} callback
 * @param {DM_DERIVATIVES} operation
 */
function childIterator (datamodel, callback, operation) {
    const children = datamodel._children;
    children.forEach((child) => {
        if (child._derivation
            && child._derivation.length === 1) {
            switch (operation) {
            case DM_DERIVATIVES.SELECT:
                if (child._derivation[0].op === DM_DERIVATIVES.SELECT) {
                    callback(child, child._derivation[0].criteria);
                }
                break;
            case DM_DERIVATIVES.PROJECT:
                if (child._derivation[0].op === DM_DERIVATIVES.PROJECT) {
                    callback(child, child._derivation[0].meta.actualProjField);
                }
                break;
            case DM_DERIVATIVES.GROUPBY:
                if (child._derivation[0].op === DM_DERIVATIVES.GROUPBY) {
                    callback(child,
                        { groupByString: child._derivation[0].meta.groupByString,
                            reducer: child._derivation[0].criteria });
                }
                break;
            case DM_DERIVATIVES.CAL_VAR:
                if (child._derivation[0].op === DM_DERIVATIVES.CAL_VAR) {
                    let params = [child._derivation[0].meta.config, [child._derivation[0].meta.fields,
                        child._derivation[0].criteria]];
                    callback(child, ...params);
                }
                break;
            }
        }
    });
}

/**
 * Invokes a callback for every child created by a selection operation on a DataModel.
 *
 * @param {DataModel} datamodel - The input DataModel instance.
 * @param {Function} callback - The callback to be invoked on each child. The parameters
 * provided to the callback are the child DataModel instance and the selection
 * function used to create it.
 */
export function selectIterator (datamodel, callback) {
    childIterator(datamodel, callback, DM_DERIVATIVES.SELECT);
}

/**
 * Invokes a callback for every measure child of a DataModel.
 *
 * @param {DataModel} datamodel - The input DataModel instance.
 * @param {Function} callback - The callback to be invoked on each measure child. The parameters
 * provided to the callback are the child DataModel instance and the child params.
 */
export function calculatedVariableIterator (datamodel, callback) {
    childIterator(datamodel, callback, DM_DERIVATIVES.CAL_VAR);
}

/**
 * Invokes a callback for every projected child of a DataModel.
 *
 * @param {DataModel} datamodel - The input DataModel instance.
 * @param {Function} callback - The callback to be invoked on each projected child. The parameters
 * provided to the callback are the child DataModel instance and the
 * projection string.
 */
export function projectIterator (datamodel, callback) {
    childIterator(datamodel, callback, DM_DERIVATIVES.PROJECT);
}

/**
 * Invokes a callback over the children created by a groupBy
 * operation on a DataModel.
 *
 * @param {DataModel} datamodel - The input DataModel instance.
 * @param {Function} callback - The callback to be invoked. The parameters
 * provided to the callback are the child DataModel instance and the groupBy string used to create it.
 */
export function groupByIterator (datamodel, callback) {
    childIterator(datamodel, callback, DM_DERIVATIVES.GROUPBY);
}

