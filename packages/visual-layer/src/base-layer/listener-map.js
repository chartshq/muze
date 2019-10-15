import { STATE_NAMESPACES } from 'muze-utils';
import * as PROPS from '../enums/props';

export const listenerMap = [
    {
        props: [`${STATE_NAMESPACES.LAYER_LOCAL_NAMESPACE}.${PROPS.DATA}`],
        type: 'registerImmediateListener',
        listener: (context, [prevData, data]) => {
            context.dataDidSet([prevData, data]);
        },
        namespace: context => context.metaInf().namespace
    }
];
