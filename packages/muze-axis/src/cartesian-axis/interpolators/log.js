import { scaleMap } from '../../scale-creator';

export default class LogInterpolator {

    createScale (config) {
        const {
            range,
            base
        } = config;
        const scaleFactory = scaleMap.log;
        this._scale = scaleFactory().range(range).base(base);
        return this._scale;
    }

    getScaleValue (domainVal) {
        const scale = this._scale;
        if (domainVal <= 0) {
            return scale(scale.domain()[0]);
        }

        return scale(domainVal) + 0.5;
    }

    sanitizeDomain (domain) {
        if (domain[0] <= 0) {
            domain[0] = Math.max(1, domain[0]);
        }
        if (domain[1] <= 0) {
            domain[1] = Math.max(1, domain[1]);
        }
        return domain;
    }
}
