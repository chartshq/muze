import { CLASSPREFIX } from '../../enums/constants';
import SpawnableSideEffect from '../spawnable';

export default class AnchorEffect extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        const context = this.firebolt.context;
        this._layers = this.addAnchorLayers(context);
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

    addAnchorLayers (context) {
        let layers = [];
        this.firebolt.context.layers().forEach((layer, idx) => {
            const shouldDrawAnchors = layer.shouldDrawAnchors();
            if (shouldDrawAnchors) {
                const encodingFieldsInf = layer.encodingFieldsInf();
                const config = layer.config();
                layers = [...layers, ...context.addLayer({
                    name: `${layer.alias()}-this.constructor.formalName()-${idx}`,
                    mark: 'point',
                    encoding: {
                        x: encodingFieldsInf.xField,
                        y: encodingFieldsInf.yField,
                        color: encodingFieldsInf.colorField,
                        size: {
                            value: 100
                        }
                    },
                    transform: config.transform,
                    transition: this.getTransitionConfig(),
                    calculateDomain: false,
                    dataSource: dt => dt.select(() => false),
                    interactive: false
                })];
            }
        });
        return layers;
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
        const anchorGroups = this.createElement(sideEffectGroup, 'g', this._layers.map(d => d.id()), className);
        const layers = this._layers;
        anchorGroups.each(function (d, i) {
            layers[i].data(dataModel).mount(this);
        });

        return this;
    }
}
