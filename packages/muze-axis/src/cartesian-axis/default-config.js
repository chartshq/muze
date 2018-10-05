import { getUniqueId } from 'muze-utils';
import { CLASSPREFIX } from '../enums/constants';

/**
 *
 *
 */
export const defaultConfig = {
    id: getUniqueId(),
    axisName: {
        defClassName: 'axis-name'
    },
    axisNamePadding: 12,
    base: 10,
    classPrefix: CLASSPREFIX,
    className: `${CLASSPREFIX}-axis`,
    exponent: 1,
    interpolator: 'linear',
    fixedBaseline: true,
    labels: {
        rotation: null,
        smartTicks: null
    },
    orientation: 'left',
    maxHeight: 50, // @todo: height and width wont be hardcoded
    maxWidth: 30,
    numberFormat: val => val,
    padding: 0.3,
    nice: true,
    numberOfTicks: 10,
    rotate: false,
    show: true,
    showAxisName: true,
    showInnerTicks: null,
    showOuterTicks: null,
    style: {},
    type: 'linear',
    tickFormat: null,
    tickValues: null,
    xOffset: undefined,
    yOffset: undefined
};

