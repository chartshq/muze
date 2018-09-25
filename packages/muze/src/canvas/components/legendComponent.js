import MuzeComponent from './muze-chart-component';

export default class LegendComponent extends MuzeComponent {
    constructor (params) {
        super(params.name, {
            height: params.component.measurement().height,
            width: params.component.measurement().width }, 0);
        this.component = params.component;
        this.params = params;
    }

    // @TODO : update max-h max-w for scroll support
    renderLegend (container) {
        this.component.mount(container);
    }

    draw (container) {
        this.renderLegend(container || this.renderAt);
    }

}
