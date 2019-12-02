import { DataModel, getObjProp, mergeRecursive, ReservedFields, dmMultipleSelection } from 'muze-utils';
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
                        color: {
                            field: getObjProp(depLayerEncoding, 'color', 'field'),
                            value: getObjProp(depLayerEncoding, 'color', 'value')
                        },
                        size: {
                            field: getObjProp(depLayerEncoding, 'size', 'field'),
                            value: () => sideEffect.defaultSizeValue()
                        }
                    };
                    const commonName = sideEffect.constructor.formalName();
                    const layerOwner = layerDef.def.name;
                    const name = `${layerOwner}-${commonName}`;
                    const defaultClassName = `${sideEffect.constructor.defaultConfig().className}`;

                    layers.push({
                        name: `${name}-upper`,
                        mark: 'point',
                        groupId: `${commonName}-upper`,
                        className: `${defaultClassName}-upper`,
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

                    if (mark === 'area') {
                        layers.push({
                            name: `${name}-lower`,
                            mark: 'point',
                            groupId: `${commonName}-lower`,
                            className: `${defaultClassName}-lower`,
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
        const upperAnchors = context.layers().filter(layer => layer.config().groupId === `${formalName}-upper`);
        const lowerAnchors = context.layers().filter(layer => layer.config().groupId === `${formalName}-lower`);

        const { target, action } = payload;
        let targetObj = null;
        if (target) {
            targetObj = target[1].reduce((acc, v, i) => {
                const field = target[0][i];
                if (field !== ReservedFields.MEASURE_NAMES) {
                    acc[field] = v;
                }
                return acc;
            }, {});
        }

        [...upperAnchors, ...lowerAnchors].forEach((layer, index) => {
            const layerConfig = layer.config();
            const linkedLayer = context.getLayerByName(layerConfig.owner);
            const linkedLayerName = linkedLayer.constructor.formalName();
            const groupId = layerConfig.groupId;
            const isUpperAnchor = groupId === `${formalName}-upper`;
            let transformedData = [];
            let schema = [];

            [transformedData, schema] = linkedLayer.getTransformedDataFromIdentifiers(dataModel, index);

            // Render both upper and lower anchors for area plot if hovered over an anchor
            if (linkedLayerName === 'area' && target && action === 'highlight') {
                const filterFn = dmMultipleSelection(target, dataModel);
                const dmFromPayload = dataModel.select(filterFn, {});

                if (!isUpperAnchor) {
                    [transformedData, schema] = linkedLayer.getTransformedDataFromIdentifiers(dmFromPayload, index);
                }
            }

            const transformedDataModel = new DataModel(transformedData, schema);
            const anchorSizeConfig = {
                encoding: {
                    size: {
                        value: () => this.defaultSizeValue() + this.getAnchorSizeOnInteraction(payload)
                    },
                    'stroke-width': {
                        value: this.getAnchorStroke(payload, targetObj)
                    }
                }
            };
            const newConfig = mergeRecursive(layerConfig, anchorSizeConfig);

            layer
                .data(transformedDataModel)
                .config(newConfig);

            return this;
        });
    }

    getAnchorStroke (payload, targetObj) {
        return (d) => {
            const dataObj = d.data.dataObj;
            const matchingData = targetObj ? Object.keys(targetObj).every((key) => {
                const val = dataObj[key];
                return val === targetObj[key];
            }) : false;
            return matchingData ? '1px' : '0px';
        };
    }
}
