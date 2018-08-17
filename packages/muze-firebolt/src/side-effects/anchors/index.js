import { CLASSPREFIX } from '../../enums/constants';
import SpawnableSideEffect from '../spawnable';

export default class AnchorEffect extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        const context = this.firebolt.context;
        this._layers = this.getAnchorLayerConfig(context);
        this._layers.forEach(layer => layer.data(context.data().select(() => false)));
    }

    static target () {
        return 'visual-unit';
    }

    static defaultConfig () {
        return {
            className: `${CLASSPREFIX}-anchors-group`
        };
    }

    static formalName () {
        return 'anchors';
    }

    getAnchorLayerConfig (context) {
        const fields = context.fields();
        const xField = `${fields.x[0]}`;
        const yField = `${fields.y[0]}`;
        const color = context.retinalFields().color;
        return context.addLayer({
            name: this.constructor.formalName(),
            mark: 'point',
            encoding: {
                x: xField,
                y: yField,
                color: color && color.field,
                size: {
                    value: 100
                }
            },
            dataSource: null,
            transition: this.getTransitionConfig(),
            calculateDomain: false,
            render: false,
            interactive: false
        });
    }

    getTransitionConfig () {
        return {
            disabled: true
        };
    }

    apply (selectionSet) {
        const dataModel = selectionSet.mergedEnter.model;
        const drawingInf = this.drawingContext()();
        const sideEffectGroup = drawingInf.sideEffectGroup;
        const className = this.config().className;
        const anchorGroup = this.createElement(sideEffectGroup, 'g', [1], className);
        const shouldDrawAnchors = this.firebolt.context.layers().some(layer => layer.shouldDrawAnchors());
        shouldDrawAnchors && this._layers.forEach(layer => layer.data(dataModel).mount(anchorGroup.node()));
        return this;
    }
}
