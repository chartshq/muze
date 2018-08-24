import { scaleMap } from '../../scale-creator';

export default class LinearInterpolator {

    createScale (config) {
        const {
            range
        } = config;
        const scaleFactory = scaleMap.linear;
        this._scale = scaleFactory().range(range);
        return this._scale;
    }

    getScaleValue (domainVal) {
        return this._scale(domainVal) + 0.5;
    }

    sanitizeDomain (domain) {
        return domain;
    }
}
