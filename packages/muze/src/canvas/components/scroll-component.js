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
        params.component.logicalSpace({ width: 20, height: 500 });
        super(params.name, params.component.getLogicalSpace(), 0);
        this.setParams(params);

        // createScroll('vertical', mount, {
        //     classPrefix: 'muze'
        // }, { width: 20, height: 500 });
        // createScroll('horizontal', mount, {
     //     classPrefix: 'muze'
     // }, { width: 500, height: 20 });
    }

    draw (container) {
        this.component.createScroll(container || document.getElementById(this.renderAt()), this.params.config);
        // this.renderScrollBar(container || document.getElementById(this.renderAt()));
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
