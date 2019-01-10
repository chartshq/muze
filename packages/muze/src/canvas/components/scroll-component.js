import MuzeComponent from './muze-chart-component';

import { HorizontalScrollMaker } from './scroll-bar-maker/horizontal-scroll-maker';
import { VerticalScrollMaker } from './scroll-bar-maker/vertical-scroll-maker';

const scrollMakerMap = {
    horizontal: HorizontalScrollMaker,
    vertical: VerticalScrollMaker
};

export default class ScrollComponent extends MuzeComponent {
    constructor (params) {
        const ScrollMaker = scrollMakerMap[params.config.type];

        params.component = new ScrollMaker();

        params.component.logicalSpace(params.dimensions);
        super(params.name, params.component.getLogicalSpace(), 0);
        this.setParams(params);
    }

    draw (container) {
        this.component.createScroll(container || document.getElementById(this.renderAt()), this.params.config);
        return this;
    }

    attachScrollAction (callback) {
        this.component.attachScrollAction(callback);
        return this;
    }

    updateWrapper (params) {
        this.name(params.name);
        this.boundBox(params.component.getLogicalSpace());
        return this;
    }

    setParams (params) {
        this.component = params.component;
        this.params = params;
        this.target(params.config.target);
        this.position(params.config.position);
        this.className(params.config.className);
        this.alignWith(params.config.alignWith);
        this.alignment(params.config.alignment);
    }
}
