import { intersect } from 'muze-utils';

export const spaceOutBoxes = (boxes, extent, showVertically) => {
    let y;
    let height;
    let x;
    let width;
    let i;
    const pad = 5;
    const len = boxes.length;
    const spaceOutIfOverlap = (firstBox, secondBox, opposite) => {
        x = firstBox.x;
        width = firstBox.width;
        y = firstBox.y;
        height = firstBox.height;
        const bottom = y + height;
        const right = x + width;

        if (showVertically) {
            if (opposite ? y < (secondBox.y + secondBox.height) : bottom > secondBox.y) {
                secondBox.y = opposite ? firstBox.y - secondBox.height - pad :
                        bottom + pad;
            }
        } else if (opposite ? x < (secondBox.x + secondBox.width) : right > secondBox.x) {
            secondBox.x = opposite ? firstBox.x - secondBox.width - pad :
                    right + pad;
        }
    };

    boxes.sort((a, b) => (showVertically ? a.y - b.y : a.x - b.x));
    i = 0;

    for (i = 0; i < len - 1; i++) {
        spaceOutIfOverlap(boxes[i], boxes[i + 1]);
    }

    if ((boxes[i].y + boxes[i].height) > extent.height ||
            (boxes[i].x + boxes[i].width) > extent.width) {
        if (showVertically) {
            boxes[i].y -= (boxes[i].height + boxes[i].y) - extent.height;
        } else {
            boxes[i].x -= (boxes[i].width + boxes[i].x) - extent.width;
        }
        for (i = len - 1; i > 0; i--) {
            spaceOutIfOverlap(boxes[i], boxes[i - 1], true);
        }
    }
    return boxes;
};

export const shouldApplySideEffect = (dm, sideEffect) => {
    const propagationInf = sideEffect.firebolt.getPropagationInf();
    if (propagationInf.sourceIdentifiers && dm) {
        const { fields } = propagationInf.sourceIdentifiers;
        const sourceDims = fields.filter(field => field.type === 'dimension').map(d => d.name);
        const dims = Object.keys(dm.getFieldspace().getDimension());
        return intersect(sourceDims, dims).length;
    }
    return true;
};
