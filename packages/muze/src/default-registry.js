import { cellRegistry, SimpleCell } from 'visual-cell';
import { VisualUnit } from 'visual-unit';
import { layerRegistry } from 'visual-layer';
import { SimpleGroup, VisualGroup } from 'visual-group';

export const COMPONENTS = {
    VisualGroup,
    VisualUnit,
};
export const SUBREGISTRIES = {
    cellRegistry,
    layerRegistry
};
export const INTERFACES = {
    SimpleGroup,
    SimpleCell
};
