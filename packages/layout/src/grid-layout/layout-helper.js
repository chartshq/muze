import RowMatrix from '../visual-matrix/row-matrix';
import ColumnMatrix from '../visual-matrix/column-matrix';

export const generateVisualMatrices = (context, matrices) => {
    // Set of matrices for layout is generated starting with the left matrix
    let leftMatrix = [];
    let rightMatrix = [];
    let topMatrix = [];
    let bottomMatrix = [];
    let begColCells;
    let endColCells;
    const {
        isRowSizeEqual,
        isColumnSizeEqual,
        gutterSpace,
        distribution,
        border,
        breakPage,
        priority
    } = context.config();
    const {
        minUnitHeight,
        minUnitWidth
    } = context.measurement();
    const { top, center, bottom } = matrices;
    const [topLeft, topColumns, topRight] = top;
    const [leftRows, valueMatrix, rightRows] = center;
    const [bottomLeft, bottomColumns, bottomRight] = bottom;

    if (leftRows.length > 0) {
        // If no left matrix is present, context will be empty
        leftMatrix = [...topLeft, ...leftRows, ...bottomLeft];
    }
    if (rightRows.length > 0) {
        // If no right matrix is present, context will be empty
        rightMatrix = [...topRight, ...rightRows, ...bottomRight];
    }
    if (topColumns.length > 0 && topColumns[0].length > 0) {
        // If no top matrix is present, context will be empty
        topMatrix = topColumns.map((d, i) => [...topLeft[i], ...d, ...topRight[i]]);
    }
    if (bottomColumns.length > 0 && bottomColumns[0].length > 0) {
        // If no bottom matrix is present, context will be empty
        bottomMatrix = bottomColumns.map((d, i) => [...bottomLeft[i], ...d, ...bottomRight[i]]);
    }

    context.rowMatrix(new RowMatrix([leftMatrix, rightMatrix], {
        isDistributionEqual: isRowSizeEqual,
        distribution: distribution.rows,
        gutter: gutterSpace.rows,
        unitMeasures: {
            width: minUnitWidth,
            height: minUnitHeight,
            border: border.width
        },
        priority: priority.row,
        breakPage: breakPage.rows.map(e => e + Math.max(topLeft.length, topRight.length)),
        extraCellLengths: [topLeft.length, bottomLeft.length]
    }));

    if (topLeft.length > 0) {
        begColCells = topLeft[0].length;
    } else {
        begColCells = bottomLeft.length > 0 ? bottomLeft[0].length : 0;
    }

    if (topRight.length > 0) {
        endColCells = topRight[0].length;
    } else {
        endColCells = bottomRight.length > 0 ? bottomRight[0].length : 0;
    }

    context.columnMatrix(new ColumnMatrix([topMatrix, bottomMatrix], {
        isDistributionEqual: isColumnSizeEqual,
        distribution: distribution.columns,
        gutter: gutterSpace.columns,
        isTransposed: true,
        unitMeasures: {
            width: minUnitWidth,
            height: minUnitHeight,
            border: border.width
        },
        priority: priority.col,
        breakPage: breakPage.columns,
        extraCellLengths: [begColCells, endColCells]
    }));
    context.centerMatrix(valueMatrix);

    return matrices;
};
