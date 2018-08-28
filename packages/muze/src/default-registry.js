import { cellRegistry, SimpleCell } from '@chartshq/visual-cell';
import { VisualUnit } from '@chartshq/visual-unit';
import { layerRegistry } from '@chartshq/visual-layer';
import { SimpleGroup, VisualGroup } from '@chartshq/visual-group';

export const COMPONENTS = {
    VisualGroup,
    VisualUnit
};
export const SUBREGISTRIES = {
    cellRegistry,
    layerRegistry
};
export const INTERFACES = {
    SimpleGroup,
    SimpleCell
};

