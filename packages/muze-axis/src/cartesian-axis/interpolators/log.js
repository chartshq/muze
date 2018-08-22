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
        if (domainVal <= 0) {
            return 1;
        }

        return this._scale(domainVal) + 0.5;
    }

    sanitizeDomain (domain) {
        if (domain[0] <= 0) {
            return [Math.max(1, domain[0]), Math.max(1, domain[1])];
        } return domain;
    }
}
