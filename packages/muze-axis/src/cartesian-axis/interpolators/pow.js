import { scaleMap } from '../../scale-creator';

export default class PowInterpolator {

    createScale (config) {
        const {
            range,
            exponent
        } = config;
        const scaleFactory = scaleMap.pow;
        this._scale = scaleFactory().range(range).exponent(exponent);
        return this._scale;
    }

    getScaleValue (domainVal) {
        return this._scale(domainVal) + 0.5;
    }

    sanitizeDomain (domain) {
        return domain;
    }
}
