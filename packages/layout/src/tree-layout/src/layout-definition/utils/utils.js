/**
 * Compares two strings in lowercase
 *
 * @export
 * @param {string} value the value to be compared
 * @param {string} compareTo whom the value would be compared
 * @return {boolean} true if values are equal
 */
function isEqual (value, compareTo) {
    if (typeof value !== 'string' || typeof compareTo !== 'string') {
        throw new TypeError('value and compareTo must be string');
    }
    return value.toLowerCase() === compareTo.toLowerCase();
}

const getNodeId = (() => {
    let _uid = 0;
    return () => `node-${++_uid}`;
})();

function yExtraSpace (node) {
    let smallestHeight = 0;
    if (node.getCutType() === 'v') {
        smallestHeight = smallestExtraHeightHorizontally(node); // eslint-disable-line no-use-before-define
    } else if (node.getCutType() === 'h') {
        node.children.forEach((child) => {
            smallestHeight += yExtraSpace(child);
        });
    } else if (node.model.host && node.model.host.getLogicalSpace) {
        const containerHeight = node.boundBox.height;
        const hostHeight = node.model.host.getLogicalSpace().height;

        smallestHeight = containerHeight - hostHeight;
        if (smallestHeight < 0) {
            smallestHeight = 0;
        }
    } else {
        smallestHeight = 0;
    }
    return smallestHeight;
}

function smallestExtraHeightHorizontally (node) {
    let smallestHeight = Number.MAX_SAFE_INTEGER;
    node.children.forEach((child) => {
        const h = yExtraSpace(child);
        if (h < smallestHeight) {
            smallestHeight = h;
        }
    });
    return smallestHeight;
}

function xExtraSpace (node) {
    let smallestWidth = 0;
    if (node.getCutType() === 'h') {
        smallestWidth = smallestExtraWidthVertically(node); // eslint-disable-line no-use-before-define
    } else if (node.getCutType() === 'v') {
        node.children.forEach((child) => {
            smallestWidth += xExtraSpace(child);
        });
    } else if (node.model.host && node.model.host.getLogicalSpace) {
        const containerWidth = node.boundBox.width;
        const hostWidth = node.model.host.getLogicalSpace().width;
        smallestWidth = containerWidth - hostWidth;
        if (smallestWidth < 0) {
            smallestWidth = 0;
        }
    } else {
        smallestWidth = 0;
    }
    return smallestWidth;
}

function smallestExtraWidthVertically (node) {
    let smallestWidth = Number.MAX_SAFE_INTEGER;
    node.children.forEach((child) => {
        const w = xExtraSpace(child);
        if (w < smallestWidth) {
            smallestWidth = w;
        }
    });
    return smallestWidth;
}

function determineBoundBox (bb, i, arr, instance) {
    if (i) {
    // if not first sibling, take boundbox from previous sibling
        const lastSibling = arr[i - 1];
        return {
            width: bb.width,
            height: bb.height,

            top: instance._parentCut === 'h'
        ? lastSibling.boundBox.top + lastSibling.boundBox.height : lastSibling.boundBox.top,

            left: instance._parentCut === 'h'
        ? lastSibling.boundBox.left : lastSibling.boundBox.left + lastSibling.boundBox.width
        };
    }
  // if first sibling, take boundbox from parent
    return {
        width: bb.width,
        height: bb.height,
        top: instance.parent.boundBox.top,
        left: instance.parent.boundBox.left
    };
}

export {
  isEqual,
  getNodeId,
  yExtraSpace,
  xExtraSpace,
  determineBoundBox,
  smallestExtraWidthVertically,
  smallestExtraHeightHorizontally
};
