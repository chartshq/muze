import { DataModel, getObjProp, mergeRecursive } from 'muze-utils';
import { CLASSPREFIX } from '../../enums/constants';
import { ANCHORS } from '../../enums/side-effects';
import SpawnableSideEffect from '../spawnable';
import './styles.scss';

const addLayer = (layerRegistry, context, sideEffect) => {
    // mark -> area (2 layers)
    context.addLayer((layerDefs) => {
        const layers = [];
        if (layerDefs[0].mark === 'area') {
            const lowerAnchorLayr = {
                mark: 'area',
                order: 1,
                def: {
                    mark: 'area',
                    encoding: layerDefs[0].def.encoding,
                    name: 'area-0',
                    order: 1
                }
            };
            layerDefs.push(lowerAnchorLayr);
        }

        if (layerDefs) {
            layerDefs.forEach((layerDef, index) => {
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
                    const name = `${layerDef.def.name}-${commonName}-${index}`;
                    const defaultClassName = `${sideEffect.constructor.defaultConfig().className}`;
                    const className = `${defaultClassName}-${index % 2 === 0 ? 'lower' : 'upper'}`;

                    layers.push({
                        name,
                        mark: 'point',
                        groupId: commonName,
                        className,
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

        this.firebolt.context._dependencies.throwback.registerChangeListener('onLayerDraw', () => {
            const currentLayers = this.firebolt.context.layers();
            const payload = this._currentPayload;
            if (payload) {
                this.setAnchorLayerStyle(currentLayers, payload);
            }
            this._currentPayload = null;
        });
    }

    setAnchorLayerStyle (layers, payload) {
        const anchorLayers = layers.filter(l => l.config().groupId === 'anchors');
        anchorLayers.forEach((anchor) => {
            // Execute focusStroke interaction of anchor point layer
            const data = anchor.data();
            const ids = data.getUids();
            const layerName = this.constructor.formalName();
            const defaultInteractionLayerEncoding = anchor.config().encoding.interaction;
            const currentInteraction = defaultInteractionLayerEncoding[layerName];
            const formattedUids = payload.target ? anchor.getUidsFromPayload({
                model: data,
                uids: ids.map(id => [id])
            }, payload.target).uids : [];

            if (!formattedUids.length) {
                anchor.applyInteractionStyle(currentInteraction, ids, { apply: false });
            } else {
                anchor.applyInteractionStyle(currentInteraction, formattedUids, { apply: true });
            }
        });
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
        return 70;
    }

    // Default offset by which anchor size is changed
    getAnchorSizeOnInteraction ({ dragEnd }) {
        if (dragEnd) {
            return 40;
        }
        return 0;
    }

    apply (selectionSet, payload) {
        const dataModel = selectionSet.mergedEnter.model;
        const formalName = this.constructor.formalName();
        const context = this.firebolt.context;
        const layers = context.layers().filter(layer => layer.config().groupId === formalName);

        layers.forEach((layer, index) => {
            const linkedLayer = context.getLayerByName(layer.config().owner);
            // selected data -> stacked data -> new dm
            const [transformedData, schema] = linkedLayer.getTransformedDataFromIdentifiers(dataModel, index);
            const transformedDataModel = new DataModel(transformedData, schema);
            const anchorSizeConfig = {
                encoding: {
                    size: {
                        value: () => this.defaultSizeValue() + this.getAnchorSizeOnInteraction(payload)
                    }
                }
            };

            const newConfig = mergeRecursive(layer.config(), anchorSizeConfig);

            layer
                .data(transformedDataModel)
                .config(newConfig);

            this._currentPayload = payload;
            return this;
        });
    }
}
