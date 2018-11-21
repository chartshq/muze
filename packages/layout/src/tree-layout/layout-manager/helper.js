import DefinitionManager from '../layout-definition/definition-manager';

export function sanitizeConfig (context, hostObj) {
    if (hostObj.lanes() && hostObj.lanes().length) {
        hostObj.lanes().forEach(childHost => sanitizeConfig(context, childHost));
    }
    if (hostObj.host() != null && typeof (hostObj.host()) === 'string') {
        if (context.componentMap().get(hostObj.host()) !== undefined) {
            hostObj.host(context.componentMap().get(hostObj.host()));
        }
    }
}

export function calLayOutDef (context) {
    const defManager = new DefinitionManager(context.layoutDef().componentMap(),
                                              context.prioritySequence(),
                                              context.dimension().height,
                                              context.dimension().width);
    const genLayoutdef = defManager.generateConfigModel();
    return genLayoutdef;
}
