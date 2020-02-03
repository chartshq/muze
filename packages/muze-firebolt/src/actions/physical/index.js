import drag from './drag';
import hover from './hover';
import { longtouch } from './longtouch';
import { touchdrag } from './touch-drag';
import { selectionBoxDrag } from './selection-box-drag';
import * as ACTION_NAMES from '../../enums/actions';
import click from './click';

export const physicalActions = {
    [ACTION_NAMES.DRAG]: drag,
    [ACTION_NAMES.HOVER]: hover,
    [ACTION_NAMES.CLICK]: click,
    [ACTION_NAMES.LONGTOUCH]: longtouch,
    [ACTION_NAMES.TOUCHDRAG]: touchdrag,
    [ACTION_NAMES.SELECTIONDRAG]: selectionBoxDrag
};

