import DefinitionManager from '../layout-definition/definition-manager';

export function sanitizeConfig (context, hostObj) {
    const hostID = hostObj.host();
    if (hostObj.lanes() && hostObj.lanes().length) {
        hostObj.lanes().forEach(childHost => sanitizeConfig(context, childHost));
    }
    if (hostID != null && typeof (hostID) === 'string') {
        if (context.componentMap().get(hostID) !== undefined) {
            hostObj.host(context.componentMap().get(hostID));
        }
    }
}

export function calLayOutDef (context) {
    const { height, width } = context.dimension();
    const defManager = new DefinitionManager(context.layoutDef().componentMap(),
                                              context.prioritySequence(),
                                              height,
                                              width);
    const genLayoutdef = defManager.generateConfigModel();
    return genLayoutdef;
}
