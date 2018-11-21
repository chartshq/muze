import { HTMLRenderer } from '../renderers/html-renderer';
import { DEFAULT_CLASS_NAME } from '../constants/defaults';
import { LayoutComponent } from '../layout-component';

export const getChildNode = (context, top, left, height, width, id) => context.renderer().createAndPositionDiv({
    top,
    left,
    height,
    width,
    id: `${id}-holder`,
    className: DEFAULT_CLASS_NAME
});

export const findNode = (context, nodeID) =>
                        context.renderer().coordinates().find(point => point.node().id() === nodeID);

export const renderHTML = (context) => {
    context.renderer(new HTMLRenderer(context.data()));
    context.renderer().createhtml(context.mount(), context.className());
};

export const drawLayout = (context) => {
    switch (context.renderer()) {
    case 'html' :
        renderHTML(context);
        break;
    default:
        renderHTML(context);
    }
};

export const drawComponent = (componentData) => {
    componentData.children().forEach((node) => {
        const host = node.model().host();
        if (host instanceof LayoutComponent) {
            host.draw();
        }
        drawComponent(node);
    });
};

export const resolveAligment = (context, componentData) => {
    componentData.children().forEach((component) => {
        const host = component.model().host();
        if (host instanceof LayoutComponent && host.alignWith()) {
            let childNode;
            const point = findNode(context, component.id()).node();
            const node = point.boundBox();
            const nodeId = point.id();
            const refNode = findNode(context, context.componentMap().get(host.alignWith()).renderAt())
                                .node()
                                .boundBox();
            switch (host.alignment()) {
            case 'left':
                childNode = getChildNode(context, node.top,
                refNode.left,
                node.height,
                Math.abs(node.width - Math.abs(refNode.left - node.left)),
                nodeId);
                break;
            case 'right':
                childNode = getChildNode(context, node.top,
                node.left,
                node.height,
                Math.abs(node.width - Math.abs(node.left + node.width - (refNode.left + refNode.width))),
                nodeId);
                break;
            case 'top':
                childNode = getChildNode(context, refNode.top,
                node.left,
                Math.abs(node.height - Math.abs(refNode.top - node.top)),
                node.width,
                nodeId);
                break;
            case 'bottom':
                childNode = getChildNode(context, node.top,
                node.left,
                Math.abs(node.top - refNode.top + refNode.height),
                node.width,
                nodeId);
                break;
            case 'h-center':
                childNode = getChildNode(context, node.top,
                refNode.left,
                node.height,
                refNode.width,
                nodeId);
                break;
            case 'v-center':
                childNode = getChildNode(context, refNode.top,
                node.left,
                refNode.height,
                node.width,
                nodeId);
                break;
            default:
                break;
            }
    // check if model in parent component
            context.componentMap().get(host.name()).renderAt(`${component.id()}-holder`);
            context.renderer().parentDiv.appendChild(childNode);
        }
        resolveAligment(context, component);
    });
};

