import {
    TOP,
    BOTTOM,
    LEFT,
    RIGHT,
    HEADER,
    TITLE,
    SUBTITLE
} from './enums/constants';

export const setSmartText = (context) => {
    const source = context.source();
    const {
        height: minHeightSpace,
        width: minWidthSpace
    } = context.minSpacing();
    const {
       margin,
       rotation
   } = context.config();
    const {
        left,
        right,
        top,
        bottom
     } = margin;
    const paddedHeight = top + bottom + minHeightSpace;
    const paddedWidth = left + right + minWidthSpace;
    const availHeight = context.availHeight() - paddedHeight;
    const availWidth = context.availWidth() - paddedWidth;
    const labelManager = context.dependencies().labelManager;

    labelManager.setStyle(context._computedStyle);

    !rotation && context.smartText(labelManager.getSmartText(source, availWidth, availHeight, false));
    rotation && context.smartText(labelManager.getSmartText(source, availHeight, availWidth, true));

    return context;
};

export const isTitleSubtitle = (subType) => {
    let returnVal = false;
    if (subType === `${TITLE}` || subType === `${SUBTITLE}`) {
        returnVal = true;
    }
    return returnVal;
};

/**
* Computes the Logical Space for the text
*
* @param {Object} context Required to get the needed parameters to compute text space
* @return {Object} Logical space taken up by text
* @memberof TextCell
*/
export const computeTextSpace = (context) => {
    const { labelManager } = context.dependencies();
    const {
        height: minHeightSpace,
        width: minWidthSpace
    } = context.minSpacing();
    const {
       margin,
       show,
       maxLines,
       minCharacters
   } = context.config();
    const {
       left,
       right,
       top,
       bottom
    } = margin;
    const paddedHeight = top + bottom + minHeightSpace;
    const paddedWidth = left + right + minWidthSpace;
    const availHeight = context.availHeight() - paddedHeight;
    const availWidth = context.availWidth() - paddedWidth;
    const source = context.source();
    const space = context.smartText();
    const minText = new Array(minCharacters).fill('W').join('');
    const _minTextSpace = labelManager.getOriSize(minText);

    context.config({ rotation: false });
    if (space.width > (availWidth || 0) && maxLines) {
        space.height = space.oriTextHeight * maxLines;
    }
    if (availWidth && availWidth < space.width) {
        space.width = _minTextSpace.width;
    }
    if (availWidth && availWidth < Math.min(_minTextSpace.width, space.oriTextWidth)) {
        const smartSpace = labelManager.getSmartText(source, availHeight, _minTextSpace.height, true);
        const { height: smHeight, width: smWidth } = smartSpace;
        space.width = smWidth;
        space.height = smHeight;
        context.config({ rotation: true });
        context.smartText(smartSpace);
    }

    const { subType, headerPadding } = context.config();
    if (!isTitleSubtitle(subType)) {
        space.width += headerPadding[LEFT] + headerPadding[RIGHT];
    }

    if (show) {
        return {
            width: Math.ceil(space.width) + paddedWidth,
            height: Math.ceil(space.height) + paddedHeight
        };
    } return {
        width: 0,
        height: 0
    };
};

export const setPadding = (measures) => {
    const { elem, className, headerPadding, padding, type, titlePadding } = measures;
    let localPadding;
    if (isTitleSubtitle(className)) {
        localPadding = titlePadding;
    } else if (type === HEADER) {
        localPadding = headerPadding;
    } else {
        localPadding = padding;
    }
    [TOP, BOTTOM, LEFT, RIGHT].forEach((position) => {
        elem.style(`padding-${position}`, `${localPadding[position]}px`);
    });
    return elem;
};
