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
    numberFormat: val => val,
    padding: 0.3,
    nice: true,
    numberOfTicks: 10,
    rotate: false,
    show: true,
    showAxisName: true,
    showInnerTicks: true,
    showOuterTicks: true,
    style: {},
    type: 'linear',
    tickFormat: null,
    tickValues: null,
    xOffset: 0,
    yOffset: 0
};

