import { selectElement } from 'muze-utils';
import MuzeComponent from './muze-chart-component';
import { LEFT } from '../../constants';

export default class HeaderComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, params.component.getLogicalSpace(), 0);
        this.setParams(params);
    }

    renderHeader (container) {
        const layoutConfig = this.params.config;
        container = selectElement(container);
        const { align } = layoutConfig;
        const sel = container
          .selectAll(`.${layoutConfig.classPrefix}-inner-container`)
          .data([this.name]);
        sel.exit().remove();
        const selEnter = sel.enter().append('div');

        const cont = selEnter.merge(sel);
        cont.classed(`${layoutConfig.classPrefix}-inner-container`, true);
        const { height, width } = this.boundBox();
        this.component.setAvailableSpace(width, height);

        this.component && this.component.render(cont.node());

        cont.selectAll('div').classed(`${layoutConfig.classPrefix}-inner-content`, true);
        cont.style('width', `${100}%`);

        if (layoutConfig && this.component) {
            cont.style('float', LEFT)
                            .style('text-align', align);
                            // .style(`padding-${position === TOP ? BOTTOM : TOP}`, `${padding}px`);
        }
    }

    draw (container) {
        this.renderHeader(container || document.getElementById(this.renderAt()));
    }

    updateWrapper (params) {
        this.setParams(params);
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

    setSpatialConfig (conf) {
        this.boundBox({ top: conf.y,
            left: conf.x,
            width: conf.width,
            height: conf.height });
        this.renderAt(conf.renderAt);
    }
}
