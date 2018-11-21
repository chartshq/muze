import { NODE_PREFIX } from '../../constants/defaults';
import DefinitionModel from '../definition-manager/definitionModel';
import DummyComponent from '../../layout-component/dummy-component';
/**
 * Compares two strings in lowercase
 *
 * @export
 * @param {string} value the value to be compared
 * @param {string} compareTo whom the value would be compared
 * @return {boolean} true if values are equal
 */
export function isEqual (value, compareTo) {
    if (typeof value !== 'string' || typeof compareTo !== 'string') {
        throw new TypeError('value and compareTo must be string');
    }
    return value.toLowerCase() === compareTo.toLowerCase();
}

export const getNodeId = (() => {
    let _uid = 0;
    return () => `${NODE_PREFIX}-${++_uid}`;
})();

export function yExtraSpace (node) {
    let smallestHeight = 0;
    if (node.getCutType() === 'v') {
        smallestHeight = smallestExtraHeightHorizontally(node); // eslint-disable-line no-use-before-define
    } else if (node.getCutType() === 'h') {
        node.children().forEach((child) => {
            smallestHeight += yExtraSpace(child);
        });
    } else if (node.model().host() && node.model().host().getLogicalSpace) {
        const containerHeight = node.boundBox().height;
        const hostHeight = node.model().host().getLogicalSpace().height;

        smallestHeight = containerHeight - hostHeight;
        if (smallestHeight < 0) {
            smallestHeight = 0;
        }
    } else {
        smallestHeight = 0;
    }
    return smallestHeight;
}

export function smallestExtraHeightHorizontally (node) {
    let smallestHeight = Number.MAX_SAFE_INTEGER;
    node.children().forEach((child) => {
        const h = yExtraSpace(child);
        if (h < smallestHeight) {
            smallestHeight = h;
        }
    });
    return smallestHeight;
}

export function xExtraSpace (node) {
    let smallestWidth = 0;
    if (node.getCutType() === 'h') {
        smallestWidth = smallestExtraWidthVertically(node); // eslint-disable-line no-use-before-define
    } else if (node.getCutType() === 'v') {
        node.children().forEach((child) => {
            smallestWidth += xExtraSpace(child);
        });
    } else if (node.model().host() && node.model().host().getLogicalSpace) {
        const containerWidth = node.boundBox().width;
        const hostWidth = node.model().host().getLogicalSpace().width;
        smallestWidth = containerWidth - hostWidth;
        if (smallestWidth < 0) {
            smallestWidth = 0;
        }
    } else {
        smallestWidth = 0;
    }
    return smallestWidth;
}

export function smallestExtraWidthVertically (node) {
    let smallestWidth = Number.MAX_SAFE_INTEGER;
    node.children().forEach((child) => {
        const w = xExtraSpace(child);
        if (w < smallestWidth) {
            smallestWidth = w;
        }
    });
    return smallestWidth;
}

export function determineBoundBox (bb, i, arr, instance) {
    if (i) {
    // if not first sibling, take boundbox from previous sibling
        const lastSibling = arr[i - 1];
        return {
            width: bb.width,
            height: bb.height,

            top: instance.parentCut() === 'h'
        ? lastSibling.boundBox().top + lastSibling.boundBox().height : lastSibling.boundBox().top,

            left: instance.parentCut() === 'h'
        ? lastSibling.boundBox().left : lastSibling.boundBox().left + lastSibling.boundBox().width
        };
    }
  // if first sibling, take boundbox from parent
    return {
        width: bb.width,
        height: bb.height,
        top: instance.parent().boundBox().top,
        left: instance.parent().boundBox().left
    };
}

// prepares the targetComponent Map for target Mapping ie. where a component should lie
export function prepareTargetComponentMap (context) {
    context.targetComponentMap(new Map());
    context.componentMap().forEach((value) => {
        if (context.targetComponentMap().has(value.target())) {
            context.targetComponentMap().get(value.target()).push(value);
        } else {
            const temp = [];
            temp.push(value);
            context.targetComponentMap().set(value.target(), temp);
        }
    });
}

export function getComponent (canvasComponent, componentName) {
    const comp = canvasComponent.find(component => component.name() === componentName);
    return (comp && comp !== -1) ? comp : null;
}
export function createPlaceHolderComponent (height, width, position) {
    const comp = new DummyComponent(0, { height, width });
    comp.name('placeHolder');
    comp.position(position);
    return comp;
}

export function placeComponent (definitionModel, component, isPreferred = false, isGridComponent = false) {
    if (!component) {
        return { first: definitionModel, second: definitionModel };
    }
    const componentDimension = component.getLogicalSpace();
    const componentHeight = componentDimension.height;
    const componentWidth = componentDimension.width;
    let cut = '';
    let componentRatioWidth = 1;
    let leftOvercomponentRationWidth = 1;
    let leftHeight = 0;
    let leftWidth = 0;
    if (component.position() === 'top' || component.position() === 'bottom') {
        cut = 'h';
        componentRatioWidth = componentHeight / definitionModel.remainingHeight();
        leftHeight = definitionModel.remainingHeight() - componentHeight;
        leftWidth = definitionModel.remainingWidth();
    } else {
        cut = 'v';
        componentRatioWidth = componentWidth / definitionModel.remainingWidth();
        leftWidth = definitionModel.remainingWidth() - componentWidth;
        leftHeight = definitionModel.remainingHeight();
    }
    leftOvercomponentRationWidth = 1 - componentRatioWidth;

// update parentModel
    definitionModel.cut(cut);

    const firstLane = new DefinitionModel(component.name(),
                                            null,
                                            componentRatioWidth,
                                            isGridComponent ? false : isPreferred,
                                            []);
    firstLane.remainingHeight(componentHeight);
    firstLane.remainingWidth(componentWidth);
    const secondLane = new DefinitionModel(null,
                                            null,
                                            leftOvercomponentRationWidth,
                                            isGridComponent ? false : !isPreferred,
                                            []);
    secondLane.remainingHeight(leftHeight);
    secondLane.remainingWidth(leftWidth);
    if (isPreferred) {
        definitionModel.lanes([firstLane]);
    } else if (component.position() === 'top' || component.position() === 'left') {
        definitionModel.lanes([firstLane, secondLane]);
    } else {
        definitionModel.lanes([secondLane, firstLane]);
    }
    return { first: firstLane, second: secondLane };
}

export function placeGridComponent (definitionModel, gridComponents) {
    const rows = gridComponents.length;
    const column = rows ? gridComponents[0].length : 0;

    const height = gridComponents.reduce((acc, val) => (acc + val[0].getLogicalSpace().height), 0);
    let tempDefModel = definitionModel;
    for (let i = 0; i < column; i++) {
        const iscolumnPreffered = i === column - 1;
        const columnPlaceHolderComponent = createPlaceHolderComponent(height,
                                                    gridComponents[0][i].getLogicalSpace().width, 'left');
        const { first, second } = placeComponent(tempDefModel, columnPlaceHolderComponent, iscolumnPreffered);
        tempDefModel = first;
        for (let j = 0; j < rows; j++) {
            const rowpreffred = j === (rows - 1);
            tempDefModel = placeComponent(tempDefModel, gridComponents[j][i], rowpreffred, true).second;
        }
        tempDefModel = second;
    }
}

export function negotiateDimension (node) {
    let preferred;
    let cumultiveExtraSpaceAmt = 0;
    let alteredDim;
    let nonAlteredDim;
    const childrenLength = node.children().length;

    for (let index = 0; index < childrenLength; index++) {
        let fn;
        let extraSpaceAmt;
        const child = node.children()[index];

        if (child.parentCut() === 'h') {
            fn = yExtraSpace;
            alteredDim = 'height';
            nonAlteredDim = 'width';
        } else {
            fn = xExtraSpace;
            alteredDim = 'width';
            nonAlteredDim = 'height';
        }
  // if vertical then get extra height from other node and push it to the preferred node.
  // for horizontal cut the same thing is to be done with width
        if (child.isPreferred()) {
    // push extra space in sink. Execute it when all non preferred space are computed.
            preferred = child;

            continue; // eslint-disable-line no-continue
        }
  // reduce own height and save it in a var
        cumultiveExtraSpaceAmt += (extraSpaceAmt = fn(child));
        child.boundBox()[alteredDim] -= extraSpaceAmt;
  // update nonaltered dim from parent for any change which happened during negotiation
        child.boundBox()[nonAlteredDim] = child.parent().boundBox()[nonAlteredDim];

        negotiateDimension(child);
    }

    if (preferred) {
        preferred.boundBox()[alteredDim] += cumultiveExtraSpaceAmt;
        preferred.boundBox()[nonAlteredDim] = preferred.parent().boundBox()[nonAlteredDim];
        negotiateDimension(preferred);
    }
}

export function computePosition (node) {
    node.children().forEach((child, i, children) => {
        const boundBox = determineBoundBox(child.boundBox(), i, children, child);
        child.boundBox(boundBox);
        computePosition(child);
    });
}

export function allocateBoundingBox (node) {
    const totalWeight = node.children()
                            .map(child => child.model().ratioWeight())
                            .reduce((carry, val) => carry + val, 0);

    node.children().forEach((child, i, children) => {
        const lastSibling = children[i - 1];
        const ratio = child.model().ratioWeight() / totalWeight;

        if (child.parentCut() === 'h') {
            child.boundBox({
                top: i ? lastSibling.boundBox().top + lastSibling.boundBox().height : 0,
                left: child.parent().boundBox().left,
                height: child.parent().boundBox().height * ratio,
                width: child.parent().boundBox().width
            });
        } else {
            child.boundBox({
                top: child.parent().boundBox().top,
                left: i ? lastSibling.boundBox().left + lastSibling.boundBox().width : 0,
                height: child.parent().boundBox().height,
                width: child.parent().boundBox().width * ratio
            });
        }
        allocateBoundingBox(child);
    });
}

