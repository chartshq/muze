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
        params.component.config(params.config.scrollBarComponentConfig);
        params.component.logicalSpace(params.dimensions);
        super(params.name, params.component.getLogicalSpace(), 0);
        this.setParams(params);
    }

    scrollBarManager (...manager) {
        if (manager.length) {
            this.component.scrollBarManager(manager[0]);
            return this;
        }
        return this.component.scrollBarManager();
    }

    scrollDeltaTo (delta) {
        this.component.scrollDeltaTo(delta);
        return this;
    }
    scrollTo (scrollPercentage) {
        this.component.scrollTo(scrollPercentage);
        return this;
    }

    scrollToUnit (unitNum) {
        this.component.scrollTo(this.component.unitPositions()[unitNum + 1]);
    }

    getScrollPositionsForUnits () {
        return this.component.unitPositions();
    }

    triggerScrollBarAction (movement) {
        this.component.triggerScrollBarAction(movement);
    }

    draw (container) {
        this.component.createScroll(container || document.getElementById(this.renderAt()));
        return this;
    }

    changeScrollPosition (newPosition) {
        this.component.changeScrollPosition(newPosition);
    }

    attachScrollAction (callback) {
        this.component.attachScrollAction(callback);
        return this;
    }

    updateWrapper (params) {
        this.name(params.name);
        this.component.config(params.config.scrollBarComponentConfig);
        this.component.logicalSpace(params.dimensions);
        this.boundBox(this.component.getLogicalSpace());
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

    remove () {
        this.component.remove();
    }
}
