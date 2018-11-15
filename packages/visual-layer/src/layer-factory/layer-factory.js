import { isSimpleObject, mergeRecursive, getObjProp } from 'muze-utils';

const parseLayerDefinition = (sink, definition, layerDef, layerType) => {
    for (const key in definition) {
        if (Object.hasOwnProperty.call(definition, key)) {
            let strs;
            let propValue;
            const def = definition[key];
            if (isSimpleObject(def)) {
                sink[key] = {};
                parseLayerDefinition(sink[key], def, layerDef, layerType);
            } else if (typeof def === 'string' && (strs = def.split('.')) && strs[0] === layerType) {
                propValue = getObjProp(layerDef, ...strs.slice(1, strs.length));
                if (propValue !== undefined) {
                    sink[key] = propValue;
                }
            } else {
                sink[key] = def;
            }
        }
    }
};

const sanitizeEncoding = (encoding) => {
    // Create object for each encoding value if encoding value is a string
    for (const key in encoding) {
        if (typeof encoding[key] === 'string') {
            encoding[key] = {
                field: encoding[key]
            };
        }
    }
};

/**
 * Layer Factory creates layers based on the layer type. All types of layers needs to register in
 * the layer factory. For getting a layer instance, getLayer method needs to invoked with the
 * layerType and other arguments. It also registers the definition of composite layers.
 *
 * @public
 *
 * @module LayerFactory
 */
const layerFactory = (() => {
    const compositeLayers = {};
    const factoryObj = {
        setLayerRegistry: (reg) => {
            factoryObj._layerRegistry = reg;
        },
        getSerializedConf: (mark, layerDef) => {
            let serializedDefs;
            const defs = compositeLayers[mark];
            const newConf = mergeRecursive({}, layerDef);

                // If it is a composite layer then resolve all the definitions of each unit layer
            if (defs) {
                serializedDefs = defs.map((unitLayerDef) => {
                    const sDef = {};
                    parseLayerDefinition(sDef, unitLayerDef, newConf, mark);
                    sanitizeEncoding(sDef.encoding);
                    return sDef;
                });
            } else {
                const encoding = newConf.encoding;
                // Create object for each encoding value if encoding value is a string
                sanitizeEncoding(encoding);
                serializedDefs = newConf;
            }

            return serializedDefs;
        },
        getLayerInstance: (layerDef, ...params) => {
            const layerRegistry = factoryObj._layerRegistry;
            layerDef = !(layerDef instanceof Array) ? [layerDef] : layerDef;
            const instances = layerDef.map((layerObj) => {
                const layerConstructor = layerRegistry[layerObj.mark];
                return layerConstructor.create(...params);
            });
            return instances.length === 1 ? instances[0] : instances;
        },
        getLayerClass: mark => factoryObj._layerRegistry[mark],
        /**
         * Registers a new composite layer definition in the layer factory.
         *
         * @public
         *
         * @param {string} layerType Mark type of the new composite layer.
         * @param {Array} layerDefs Layer definitions of the composite layer.
         */
        composeLayers: (layerType, layerDefs) => {
            compositeLayers[layerType] = layerDefs;
        },
        sanitizeLayerConfig: (layerDef) => {
            const newConf = mergeRecursive({}, layerDef);
            sanitizeEncoding(newConf.encoding);
            return newConf;
        }
    };
    return factoryObj;
})();

export default layerFactory;
