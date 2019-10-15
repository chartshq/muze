import { cellRegistry, SimpleCell } from '@chartshq/visual-cell';
import { VisualUnit } from '@chartshq/visual-unit';
import { layerRegistry } from '@chartshq/visual-layer';
import { SimpleGroup, VisualGroup } from '@chartshq/visual-group';
import { registry as interactionRegistry } from '@chartshq/muze-firebolt';

export const COMPONENTS = {
    [VisualGroup.formalName()]: VisualGroup,
    [VisualUnit.formalName()]: VisualUnit
};

export const SUBREGISTRIES = {
    cells: cellRegistry,
    layers: layerRegistry
};
export const INTERFACES = {
    SimpleGroup,
    SimpleCell
};

const componentRegistry = (components = COMPONENTS) => {
    const reg = Object.assign({}, components);

    return {
        register: (cls) => {
            const key = cls.formalName();
            reg[key] = cls;
            return componentRegistry;
        },
        get: () => reg
    };
};

export const registry = {
    components: componentRegistry(COMPONENTS),
    cells: cellRegistry(),
    layers: layerRegistry(),
    interactions: interactionRegistry
};
