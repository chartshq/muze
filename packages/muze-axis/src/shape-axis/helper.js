/**
 *
 *
 * @param {*} domain
 * @param {*} generatorFn
 *
 */
export const shapeGenerator = (domain, generatorFn) => {
    const generatedShapes = {};
    domain.forEach((value) => {
        generatedShapes[value] = generatorFn(value);
    });
    return generatedShapes;
};
