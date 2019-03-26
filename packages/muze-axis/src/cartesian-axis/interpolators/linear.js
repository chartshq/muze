import { sanitizeDomainWhenEqual } from 'muze-utils';
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
        if (domain.length) {
            domain = sanitizeDomainWhenEqual(domain);
        }
        return domain;
    }
}
