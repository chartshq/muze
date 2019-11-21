import {
    DARK,
    NONE,
    LEFT,
    RIGHT,
    NORMAL,
    TOP,
    DARKER,
    BOTTOM

} from '../enums/constants';

export const sanitiseHeaderMatrix = (matrices, header) => {
    if (header) {
        for (let i = 0; i < matrices.length; i++) {
            if (i !== 0) {
                matrices[i].config({
                    externalClassname: [`${DARK}`]
                });
            } else {
                matrices[i].config({
                    externalClassname: [`${NONE}-${LEFT}`, `${DARK}`]
                });
            }
        }
    } else {
        for (let i = 0; i < matrices.length; i++) {
            for (let j = 0; j < matrices[0].length; j++) {
                matrices[i][j].config({
                    externalClassname: [`${DARK}`]
                });
            }
        }
    }
};

export const sanitiseGeomMatrix = (matrices, arr = {}) => {
    for (let i = 0; i < matrices.length; i++) {
        for (let j = 0; j < matrices[0].length; j++) {
            matrices[i][j].config({
                externalClassname: [`${NORMAL}`]
            });

            if (i === 0) {
                matrices[i][j].config().externalClassname.push(`${DARKER}-${TOP}`);
            } else if (i === matrices.length - 1) {
                matrices[i][j].config().externalClassname.push(`${DARKER}-${BOTTOM}`);
            }

            if (j === matrices[i].length - 1) {
                matrices[i][j].config().externalClassname.push(`${DARK}-${RIGHT}`);
            }

            if (arr[i]) {
                matrices[i - 1][j].config().externalClassname.push(`${DARK}-${BOTTOM}`);
            }
        }
    }
};

export const sanitiseFacetValues = (matrices, type) => {
    const normal = type === `${RIGHT}` ? `${DARK}` : `${NORMAL}`;
    const length = matrices.length;
    let latestSource = matrices[0][0].source();
    const lastSource = matrices[matrices.length - 1][0].source();
    const arr = {};

    // initialise the classname
    for (let i = 0; i < matrices.length; i++) {
        for (let j = 0; j < matrices[0].length; j++) {
            matrices[i][j].config({
                externalClassname: [normal]
            });
        }

        // seperate wrt the corner most facet
        if (matrices[i][0].source() !== latestSource) {
            arr[i] = i;
            latestSource = matrices[i][0].source();
        }
    }

    // add custom classname
    for (let i = 0; i < matrices.length; i++) {
        for (let j = 0; j < matrices[0].length; j++) {
            if (j === 0) {
                matrices[i][0].config().externalClassname.push(`${NONE}-${type}`);
                if (matrices[i][j].source() === lastSource) {
                    matrices[i][j].config().externalClassname.push(`${DARKER}-${BOTTOM}`);
                } else {
                    matrices[i][0].config().externalClassname.push(`${DARK}-${BOTTOM}`);
                }
            } else if (j !== matrices[i].length - 1) {
                matrices[i][j].config().externalClassname.push(`${DARK}-${type}`);
            }

            if (i === 0) {
                matrices[0][j].config().externalClassname.push(`${DARKER}-${TOP}`);
            } else if (i === length - 1) {
                matrices[i][j].config().externalClassname.push(`${DARKER}-${BOTTOM}`);
            }

            if (arr[i]) {
                matrices[i - 1][j].config().externalClassname.push(`${DARK}-${BOTTOM}`);
            }
        }
    }
    return arr;
};

export const sanitiseBorderMatrix = (matrices) => {
    const { leftMatrix, rightMatrix, topMatrix, bottomMatrix } = matrices;
    const arr = leftMatrix.length > 0 && sanitiseFacetValues(leftMatrix, `${LEFT}`);
    rightMatrix.length > 0 && sanitiseFacetValues(rightMatrix, `${RIGHT}`);
    topMatrix.length > 0 && sanitiseHeaderMatrix(topMatrix);
    bottomMatrix.length > 0 && sanitiseHeaderMatrix(bottomMatrix);
    return arr;
};
