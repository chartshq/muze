import drag from './drag';
import hover from './hover';
import { longtouch } from './longtouch';
import { touchdrag } from './touch-drag';

import * as ACTIONNAMES from '../../enums/actions';
import click from './click';

export const physicalActions = {
    [ACTIONNAMES.DRAG]: drag,
    [ACTIONNAMES.HOVER]: hover,
    [ACTIONNAMES.CLICK]: click,
    [ACTIONNAMES.LONGTOUCH]: longtouch,
    [ACTIONNAMES.TOUCHDRAG]: touchdrag
};

