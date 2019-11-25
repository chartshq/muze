import { getUniqueId } from 'muze-utils';
import { CLASSPREFIX } from '../enums/constants';

/**
 *
 *
 */
export const defaultConfig = {
    id: getUniqueId(),
    adjustRange: false,
    axisName: {
        defClassName: 'axis-name'
    },
    axisNamePadding: 7,
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
    numberOfTicks: null,
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
    yOffset: 0,
    defaultSort: 'asc'
};

