const wrapTicksConfig = {
    'top-true-true': true,
    'bottom-true-true': true
};

const rotateConfig = rotation => ({
    'top-true': rotation !== 0,
    'bottom-true': rotation !== 0,
    'left-true': rotation && isNaN(rotation),
    'right-true': rotation && isNaN(rotation)

});

export default class TickTextManager {

    multiLineTicks (labelDetails, isSmartTicks) {
        const {
            availSpace,
            _minTickDistance,
            smartTicks
        } = labelDetails;
        const smartWidth = smartTicks.reduce((acc, n) => acc + n.width + _minTickDistance, 0);

        if (availSpace && smartWidth < availSpace) {
            return true;
        } return isSmartTicks;
    }

    rotatedTicks (labelDetails, rotation) {
        const {
            availSpace,
            _minTickDistance,
            smartTicks
        } = labelDetails;
        const smartWidth = smartTicks.reduce((acc, n) => acc + n.width + _minTickDistance, 0);

        if (availSpace && smartWidth > availSpace) {
            return -90;
        } return rotation;
    }

    shouldRotateTicks (rotation, smartTicks, orientation) {
        return rotateConfig(rotation)[`${orientation}-${smartTicks !== true}`] || false;
    }

    shouldWrapTicks (rotation, smartTicks, orientation) {
        return wrapTicksConfig[`${orientation}-${smartTicks !== false}-${!rotation}`] || false;
    }

    manageTicks (config, labelDetails) {
        const {
            orientation,
            labels
        } = config;
        const {
            rotation,
            smartTicks
        } = labels;
        const labelConfig = {};

        labelConfig.smartTicks = this.shouldWrapTicks(rotation, smartTicks, orientation) ?
            this.multiLineTicks(labelDetails, smartTicks) : false;

        labelConfig.rotation = this.shouldRotateTicks(rotation, labelConfig.smartTicks, orientation) ?
            this.rotatedTicks(labelDetails, rotation) : rotation;

        return labelConfig;
    }
}
