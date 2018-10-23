import MuzeComponent from './muze-chart-component';

export default class GridComponent extends MuzeComponent {

    constructor (params) {
        super(params.name, params.config.dimensions, 0);
        this.component = params.component;
        this.params = params;
        this.target = params.config.target;
        this.className = params.config.className
    }
}
