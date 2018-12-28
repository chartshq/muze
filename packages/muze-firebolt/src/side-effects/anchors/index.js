import { DataModel, STATE_NAMESPACES, getObjProp } from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';
import SpawnableSideEffect from '../spawnable';

import './styles.scss';

const addLayer = (layerDefs, layerRegistry, context, sideEffect) => {
    const layers = [];
    if (layerDefs) {
        layerDefs.forEach((layerDef) => {
            const mark = layerDef.mark;
            const layerCls = layerRegistry[mark];
            if (layerCls && layerCls.shouldDrawAnchors()) {
                const depLayerEncoding = layerDef.def.encoding;
                const encoding = {
                    x: getObjProp(depLayerEncoding, 'x', 'field'),
                    y: getObjProp(depLayerEncoding, 'y', 'field'),
                    color: getObjProp(depLayerEncoding, 'color', 'field'),
                    size: {
                        field: getObjProp(depLayerEncoding, 'size', 'field'),
                        value: sideEffect.defaultSizeValue()
                    }
                };
                const name = `${layerDef.def.name}-${sideEffect.constructor.formalName()}`;
                const layerObj = {
                    instances: context.addLayer({
                        name,
                        mark: 'point',
                        className: sideEffect.constructor.defaultConfig().className,
                        encoding,
                        transform: {
                            type: 'identity'
                        },
                        transition: sideEffect.getTransitionConfig(),
                        calculateDomain: false,
                        source: dm => dm.select(() => false, {
                            saveChild: false
                        }),
                        interactive: false,
                        render: false
                    }),
                    linkedLayer: layerDef.def.name
                };
                layers.push(layerObj);
            }
        });
    }
    return layers;
};

export default class AnchorEffect extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        this._layersMap = {};
        this.addAnchorLayers();
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

    addAnchorLayers () {
        const context = this.firebolt.context;
        const metaInf = context.metaInf();
        const layerRegistry = context.registry().layerRegistry;
        const layerDefsVal = context.layerDef();
        context.store().registerImmediateListener(
            `${STATE_NAMESPACES.UNIT_LOCAL_NAMESPACE}.${metaInf.namespace}.layerDef`, ([, layerDefs]) => {
                this._layers = addLayer(layerDefs, layerRegistry, context, this);
            });
        this._layers = addLayer(layerDefsVal, layerRegistry, context, this);
        return this;
    }

    getTransitionConfig () {
        return {
            disabled: true
        };
    }

    /**
     * Returns the default area value of the anchor point.
     * @return { number } Default area value of anchor.
     */
    defaultSizeValue () {
        return 100;
    }

    apply (selectionSet) {
        const self = this;
        const dataModel = selectionSet.mergedEnter.model;
        if (selectionSet.isSourceFieldPresent !== false) {
            const drawingInf = this.drawingContext();
            const sideEffectGroup = drawingInf.sideEffectGroup;
            const className = `${this.config().className}`;
            const layers = this._layers;
            const parentGroup = this.createElement(sideEffectGroup, 'g', [1], `${className}-container`);
            const anchorGroups = this.createElement(parentGroup, 'g', Object.values(layers));
            anchorGroups.each(function (layer) {
                const instances = layer.instances;
                const elems = self.createElement(this, 'g', instances, className);
                const linkedLayer = self.firebolt.context.getLayerByName(layer.linkedLayer);
                const [transformedData, schema] = linkedLayer.getTransformedDataFromIdentifiers(dataModel);
                const transformedDataModel = new DataModel(transformedData, schema);
                elems.each(function (d, i) {
                    instances[i].data(transformedDataModel).mount(this);
                });
            });
        }
        return this;
    }
}
