/**
 * @module Transform
 * This file exports the transform factory.
 */
import * as TransformType from '../enums/transform-type';
import identity from '../identity-transform';
import group from '../group-transform';
import stack from '../stack-transform';

/* istanbul ignore next */
const transformMap = {
    [TransformType.IDENTITY]: identity,
    [TransformType.GROUP]: group,
    [TransformType.STACK]: stack
};

/**
 * This function is used to retirn a transform associated
 * with the given type.
 *
 * @param {string} type The type of the transform.
 * @return {Function} The transform function.
 */
function transformFactory (type) {
    const transform = transformMap[type];
    if (typeof transform !== 'function') {
        throw new Error('Invalid transform type supplied.');
    }
    return transform;
}

export default transformFactory;
