import drag from './drag';
import hover from './hover';
import click from './click';
import * as ACTIONNAMES from '../../enums/actions';

export const physicalActions = {
    [ACTIONNAMES.DRAG]: drag,
    [ACTIONNAMES.HOVER]: hover,
    [ACTIONNAMES.CLICK]: click
};

