import { createRetinalAxis } from './encoder-helper';
import { COLOR, SHAPE, SIZE } from '../enums/constants';
import VisualEncoder from './visual-encoder';

/**
 *
 *
 * @export
 * @class RetinalEncoder
 * @extends {VisualEncoder}
 */
export default class RetinalEncoder extends VisualEncoder {

    /**
     *
     *
     * @param {*} axesCreators
     * @return
     * @memberof RetinalEncoder
     */
    createAxis (axesCreators) {
        const { fieldsConfig, config } = axesCreators;
        const newAxes = {};

        [COLOR, SHAPE, SIZE].forEach((axisType) => {
            newAxes[`${axisType}`] = createRetinalAxis({ axisType, fieldsConfig }, config[axisType]);
        });
        return newAxes;
    }

    /**
     *
     *
     * @static
     * @return
     * @memberof RetinalEncoder
     */
    static type () {
        return 'retinal';
    }

    /**
     *
     *
     * @param {*} fields
     * @param {*} userLayerConfig
     * @return
     * @memberof RetinalEncoder
     */
    getLayerConfig (encodingConfigs, userLayerConfig) {
        const layerConfig = [];
        userLayerConfig.forEach((e) => {
            const config = e;
            [COLOR, SHAPE, SIZE].forEach((axis) => {
                if (encodingConfigs[axis] && encodingConfigs[axis].field) {
                    const def = config.def;
                    if (config.def instanceof Array) {
                        def.forEach((conf) => {
                            conf.encoding = conf.encoding || {};
                            !conf.encoding[axis] && (conf.encoding[axis] = {});
                            conf.encoding[axis].field = encodingConfigs[axis].field;
                        });
                    } else {
                        def.encoding = def.encoding || {};
                        !def.encoding[axis] && (def.encoding[axis] = {});
                        def.encoding[axis].field = encodingConfigs[axis].field;
                    }
                }
            });
            layerConfig.push(config);
        });
        return layerConfig;
    }

    /**
     *
     *
     * @param {*} context
     * @return
     * @memberof RetinalEncoder
     */
    setCommonDomain (context) {
        const { domains, axes, encoding } = context;

        Object.entries(encoding).forEach((enc) => {
            if (enc[1] && enc[1].field) {
                const encType = enc[0];
                const field = enc[1].field;

                if (field) {
                    axes[encType].forEach((axis) => {
                        const domain = domains[field];
                        axis.updateDomain(domain);
                    });
                }
            }
        });
        return axes;
    }
}
