import { VisualUnit } from '@chartshq/visual-unit';
import { STATE_NAMESPACES, CommonProps } from 'muze-utils';
import { BaseLayer } from '@chartshq/visual-layer';
import { getBorders, hasOneField } from '../group-helper';
import { RetinalEncoder } from '../encoder';
import { registerDomainChangeListener, unsubscribeChangeListeners } from './change-listener';
import ValueMatrix from './value-matrix';

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

export const createMatrices = (context) => {
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
    // Getting the placeholders
    if (hasOneField(resolver.getAllFields())) {
        const placeholderInfo = resolver.getMatrices(datamodel, matrixConfig, context.registry(), encoders);
        context._groupedDataModel = placeholderInfo.dataModels.groupedModel;
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
    }
    return context;
};
