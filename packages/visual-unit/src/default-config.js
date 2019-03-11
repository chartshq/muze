import { CLASSPREFIX, CONSOLIDATED } from './enums/constants';

/**
 * Returns the default configuration of the visual unit
 * @return {Object} Default configuration of visual unit
 */
export const defaultConfig = {
    classPrefix: CLASSPREFIX,
    defClassName: 'visual-unit',
    className: '',
    trackerClassName: 'visual-unit-tracker',
    minOuterRadius: 10,
    gridLines: {
        defClassName: 'axis-grid-lines',
        className: '',
        show: true,
        color: '#efefef',
        zeroLineColor: '#b6b6b6'
    },
    gridBands: {
        defClassName: 'axis-grid-bands',
        className: '',
        show: false,
        y: {
            color: ['#fff', '#fbfbfb']
        },
        x: {
            color: ['#fff', '#f9f9f9']
        }
    },
    arcLayerClassName: 'layer-arc',
    interaction: {
        tooltip: {
            mode: CONSOLIDATED
        }
    },
    sideEffectClassName: 'side-effect-container'
};
