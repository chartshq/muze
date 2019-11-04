import { DataModel, getObjProp, mergeRecursive } from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';
import { ANCHORS } from '../../enums/side-effects';
import SpawnableSideEffect from '../spawnable';
import './styles.scss';

const addLayer = (layerRegistry, context, sideEffect) => {
    context.addLayer((layerDefs) => {
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
                            value: () => sideEffect.defaultSizeValue()
                        }
                    };
                    const commonName = sideEffect.constructor.formalName();
                    const name = `${layerDef.def.name}-${commonName}`;

                    layers.push({
                        name,
                        mark: 'point',
                        groupId: commonName,
                        className: sideEffect.constructor.defaultConfig().className,
                        encoding,
                        transform: {
                            type: 'identity'
                        },
                        calculateDomain: false,
                        transition: sideEffect.getTransitionConfig(),
                        source: dm => dm.select(() => false, {
                            saveChild: false
                        }),
                        interactive: false,
                        owner: layerDef.def.name
                    });
                }
            });
        }
        return layers;
    });
};

export default class AnchorEffect extends SpawnableSideEffect {
    constructor (...params) {
        super(...params);
        this._layersMap = {};
        this.addAnchorLayers();
        // this.firebolt.context._dependencies.throwback.registerChangeListener('onLayerDraw', () => {
        //     const layers = this.firebolt.context.layers();
        //     this.setAnchorLayerStyle(layers);
        // });
    }

    setAnchorLayerStyle (layers, payload) {
        const anchorLayer = layers.filter(l => l.config().groupId === 'anchors')[0];
        if (anchorLayer) {
            // Execute focusStroke interaction of anchor point layer
            const ids = anchorLayer.data().getUids();
            const layerName = this.constructor.formalName();
            const defaultInteractionLayerEncoding = anchorLayer.config().encoding.interaction;
            const data = anchorLayer.data();
            let formattedUids = [];

            if (payload && payload.target && payload.target[0].length > 1) {
                const { target } = payload;
                const data1 = data.select((d) => {
                    if (payload.target[0].length === 2) {
                        return d[target[0][0]].internalValue === target[1][0] &&
                        d[target[0][1]].internalValue === target[1][1];
                    }
                    return d[target[0][0]].internalValue === target[1][0];
                });
                formattedUids = data1.getUids();
                // context.data(data1);
            }

            console.log('ids', formattedUids);
            if (!formattedUids.length) {
                anchorLayer.applyInteractionStyle(defaultInteractionLayerEncoding[layerName], ids, false);
            } else {
                anchorLayer.applyInteractionStyle(defaultInteractionLayerEncoding[layerName], formattedUids, true, null, payload);
            }
        }
        return true;
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
        return ANCHORS;
    }

    addAnchorLayers () {
        const context = this.firebolt.context;
        const layerRegistry = context.registry().layerRegistry;

        addLayer(layerRegistry, context, this);
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

    // Default offset by which anchor size is changed
    getAnchorSizeonInteraction () {
        return 0;
    }

    apply (selectionSet, payload) {
        const dataModel = selectionSet.mergedEnter.model;
        const formalName = this.constructor.formalName();
        const context = this.firebolt.context;
        const layers = context.layers().filter(layer => layer.config().groupId === formalName);

        layers.forEach((layer) => {
            const linkedLayer = context.getLayerByName(layer.config().owner);
            const [transformedData, schema] = linkedLayer.getTransformedDataFromIdentifiers(dataModel);
            const transformedDataModel = new DataModel(transformedData, schema);
            const anchorSizeConfig = {
                encoding: {
                    size: {
                        value: () => this.defaultSizeValue() + this.getAnchorSizeonInteraction()
                    }
                }
            };
            const newConfig = mergeRecursive(layer.config(), anchorSizeConfig);

            layer
                .data(transformedDataModel)
                .config(newConfig);

            // if (payload.target[0].length === 1) {
            //     debugger;
            // }

            this.firebolt.context._dependencies.throwback.registerChangeListener('onLayerDraw', () => {
                const layers1 = this.firebolt.context.layers();
                // console.log(payload.target);
                // debugger;
                // let isEqual = false;

                // if (this._previousTarget && this._previousTarget.length) {
                //     isEqual = arraysEqual(this._previousTarget, payload.target || []);
                // } else {
                //     this._previousTarget = payload.target;
                // }
                // if (isEqual) return false;
                this.setAnchorLayerStyle(layers1, payload);
            });

            return this;
        });
    }
}
