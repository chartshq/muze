import { selectElement } from 'muze-utils';
import { HTMLRenderer } from '../renderers/html-renderer';
import { LayoutComponent } from '../layout-component';

export const getChildNode = (context, config) =>
    context.renderer().createAndPositionDiv(config);

export const findNode = (context, nodeID) =>
    context.renderer().coordinates().find(point => point.node().id() === nodeID);

export const renderHTML = (context) => {
    context.renderer(new HTMLRenderer(context.data()));
    context.renderer().createhtml(context.mount(), context.className());
};

export const drawLayout = context => renderHTML(context);

export const drawComponent = (componentData) => {
    componentData.children().forEach((node) => {
        const host = node.model().host();
        if (host instanceof LayoutComponent) {
            host.draw();
        }
        drawComponent(node);
    });
};

export const removeElement = (elemID) => {
    if (elemID) {
        selectElement(`#${elemID}`).remove();
    }
};

const setAlignConfig = (alignment, params) => {
    let newNodeConfig = {};
    const { node, refNode } = params;
    switch (alignment) {
    case 'left':
        newNodeConfig = {
            top: node.top,
            left: refNode.left,
            height: node.height,
            width: Math.abs(node.width - Math.abs(refNode.left - node.left))
        };
        break;

    case 'right':
        newNodeConfig = {
            top: node.top,
            left: node.left,
            height: node.height,
            width: Math.abs(node.width - Math.abs(node.left + node.width - (refNode.left + refNode.width)))
        };
        break;

    case 'top':
        newNodeConfig = {
            top: refNode.top,
            left: node.left,
            height: Math.abs(node.height - Math.abs(refNode.top - node.top)),
            width: node.width
        };
        break;

    case 'bottom':
        newNodeConfig = {
            top: node.top,
            left: node.left,
            height: Math.abs(node.top - refNode.top + refNode.height),
            width: node.width
        };
        break;

    case 'h-center':
        newNodeConfig = {
            top: node.top,
            left: refNode.left,
            height: node.height,
            width: refNode.width
        };
        break;

    case 'v-center':
        newNodeConfig = {
            top: refNode.top,
            left: node.left,
            height: refNode.top,
            width: node.width
        };
        break;
    default:
        break;
    }
    return newNodeConfig;
};

export const resolveAligment = (context, componentData) => {
    componentData.children().forEach((component) => {
        const host = component.model().host();

        if (host instanceof LayoutComponent && host.alignWith()) {
            const componentToAlign = context.componentMap().get(host.alignWith());

            if (componentToAlign) {
                const point = findNode(context, component.id()).node();
                const node = point.boundBox();
                const refNode = findNode(context, componentToAlign.renderAt())
                    .node()
                    .boundBox();
                const newNodeConfig = setAlignConfig(host.alignment(), { node, refNode });

                // check if model in parent component
                Object.assign(newNodeConfig, { id: point.id(), className: host.className() });
                context.renderer().createAndPositionDiv(newNodeConfig);
                context.componentMap().get(host.name()).setSpatialConfig({
                    x: newNodeConfig.left,
                    y: newNodeConfig.top,
                    height: newNodeConfig.height,
                    width: newNodeConfig.width

                });
            }
        }

        resolveAligment(context, component);
    });
};
