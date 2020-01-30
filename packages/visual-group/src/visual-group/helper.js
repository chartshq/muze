import { VisualUnit } from '@chartshq/visual-unit';
import { STATE_NAMESPACES, CommonProps, InvalidAwareTypes } from 'muze-utils';
import { BaseLayer } from '@chartshq/visual-layer';
import { getBorders } from '../group-helper';
import { RetinalEncoder } from '../encoder';
import { registerDomainChangeListener, unsubscribeChangeListeners } from './change-listener';
import ValueMatrix from './value-matrix';
import { ROWS, COLUMNS, DATA } from '../enums/constants';

export const createUnitState = (context) => {
    const [globalState, localState] = VisualUnit.getState();
    const store = context.store();
    store.append(STATE_NAMESPACES.UNIT_GLOBAL_NAMESPACE, globalState)
        .append(STATE_NAMESPACES.UNIT_LOCAL_NAMESPACE, localState);
};

export const initializeGlobalState = (context) => {
    const globalState = context.constructor.getState()[0];
    const store = context.store();
    store.append(STATE_NAMESPACES.GROUP_GLOBAL_NAMESPACE, globalState);
};

export const createLayerState = (context) => {
    const [globalState, localState] = BaseLayer.getState();
    context.store().append(STATE_NAMESPACES.LAYER_GLOBAL_NAMESPACE, globalState)
        .append(STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE, localState);
};

const sanitizeRetinalConfig = (retinalConf) => {
    const conf = {};
    for (const key in retinalConf) {
        const confValue = retinalConf[key];
        if (typeof confValue === 'string' || !confValue) {
            conf[key] = {
                field: retinalConf[key]
            };
        } else {
            conf[key] = confValue;
        }
    }
    return conf;
};

export const setMatrixInstances = (context, placeholder) => {
    let {
        values,
        rows,
        columns
    } = placeholder;
    values = values || [];
    rows = rows || [];
    columns = columns || [];
    context._composition.matrices = {
        value: new ValueMatrix(values),
        left: new ValueMatrix(rows[0]),
        right: new ValueMatrix(rows[1]),
        top: new ValueMatrix(columns[0]),
        bottom: new ValueMatrix(columns[1])
    };

    context._dependencies.throwback.commit(CommonProps.MATRIX_CREATED, true);
    return context;
};

const hasValue = (val) => {
    let hasOneValue = false;
    for (let i = 0; i < val.length && !hasOneValue; i++) {
        for (let j = 0; j < val[i].length; j++) {
            if (!(val[i][j] instanceof InvalidAwareTypes)) {
                hasOneValue = true;
                break;
            }
        }
    }
    return hasOneValue;
};

export const updateChecker = (context, props) => props.every((option) => {
    const val = context[option]();
    switch (option) {
    case ROWS:
    case COLUMNS:
        return val !== null;
    case DATA:
        return val && !val.isEmpty() && hasValue(val.getData().data);

    default:
        return true;
    }
});

export const initializeFields = (context) => {
    const rows = context.rows();
    const columns = context.columns();
    const color = context.color();
    const datamodel = context.data();
    const size = context.size();
    const detail = context.detail();
    const layers = context.layers();
    const transform = context.transform();
    const config = context.config();
    const shape = context.shape();
    // Get the resolver for the matrices
    const resolver = context.resolver();

    resolver.store(context.store());
    resolver.valueParser(context.valueParser());

    // Prepare configuration for matrix preparation
    let matrixConfig = {
        selection: context.selection(),
        alias: context.alias(),
        globalConfig: config || {},
        rows,
        columns,
        detail,
        layers,
        transform
    };

    unsubscribeChangeListeners(context);

    const retinalConfig = sanitizeRetinalConfig({
        color,
        shape,
        size
    });

    matrixConfig = Object.assign(matrixConfig, retinalConfig);
    // Create the encoders for the group
    const encoders = {};
    encoders.retinalEncoder = new RetinalEncoder();
    encoders.simpleEncoder = context.createEncoderInstance();
    matrixConfig.coord = encoders.simpleEncoder.constructor.type();
    resolver.encoder(encoders.simpleEncoder);

    // Set the group type
    context.groupType(encoders.simpleEncoder.constructor.type());

    // Get sanitized fields as instances of the Vars Class
    const fields = encoders.simpleEncoder.fieldSanitizer(datamodel, matrixConfig);
    encoders.simpleEncoder.setAxisAndHeaders(config ? config.axisFrom : {}, fields);
    // Setting layers for the code
    layers && resolver.layerConfig(layers);
    // Set the row and column axes
    resolver.horizontalAxis(fields.rows, encoders).verticalAxis(fields.columns, encoders);

    return {
        rows,
        columns,
        color,
        datamodel,
        size,
        detail,
        layers,
        transform,
        config,
        shape,
        resolver,
        matrixConfig,
        retinalConfig,
        encoders,
        fields
    };
};

export const createMatrices = (context, sanitizedConfig) => {
    const { groupConfig, resolverConfig } = sanitizedConfig;
    const {
        config,
        resolver,
        matrixConfig,
        encoders,
        retinalConfig,
        fields
    } = groupConfig;

    const placeholderInfo = resolver.getMatrices(resolverConfig);

    context._originalGroupedData = context._groupedDataModel = placeholderInfo.dataModels.groupedModel;
        // Set the selection object
    context.selection(placeholderInfo.selection);

        // Create retinal axes
    resolver.createRetinalAxes(placeholderInfo.dataModels.parentModel.getFieldsConfig(), retinalConfig,
                encoders);

        // Domains are evaluated for each of the axes for commonality
    resolver.setRetinalAxisDomain(matrixConfig, placeholderInfo.dataModels, encoders);

        // Create matrix instances
    setMatrixInstances(context, placeholderInfo);

        // Prepare corner matrices
    context.cornerMatrices(resolver.createHeaders(placeholderInfo, fields, config));

        // Set placeholder information
    context.placeholderInfo(placeholderInfo);

    context._composition.axes = resolver.axes();
    context.metaData({
        border: getBorders(placeholderInfo, encoders.simpleEncoder)
    });

    resolver.encoder().unionUnitDomains(context);

    registerDomainChangeListener(context);
    return context;
};

export const initializeResolverFields = (context, config) => {
    const {
        datamodel,
        encoders,
        resolver,
        componentRegistry
    } = context;
    const {
            globalConfig,
            selection,
            transform
        } = config;
    const groupBy = globalConfig.autoGroupBy;
    const { smartlabel: labelManager } = resolver.dependencies();
    const fieldMap = datamodel.getFieldsConfig();
    const layerConfig = resolver.layerConfig();
    const registry = resolver.registry();
    const { fields: normalizedRows } = resolver.horizontalAxis();
    const { fields: normalizedColumns } = resolver.verticalAxis();
    const otherEncodings = resolver.optionalProjections(config, layerConfig, datamodel.getSchema());
    const facetsAndProjections = resolver.getAllFields();
    const { simpleEncoder } = encoders;
    const shouldRender = simpleEncoder.hasMandatoryFields(facetsAndProjections);
    return {
        datamodel,
        encoders,
        resolver,
        globalConfig,
        selection,
        transform,
        componentRegistry,
        groupBy,
        labelManager,
        fieldMap,
        layerConfig,
        registry,
        normalizedRows,
        normalizedColumns,
        otherEncodings,
        facetsAndProjections,
        simpleEncoder,
        shouldRender,
        config
    };
};
