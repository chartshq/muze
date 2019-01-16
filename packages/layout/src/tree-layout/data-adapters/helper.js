import DataPoint from './data-point';

export const getnodePoints = (node, nodepoints) => {
    const datapoint = new DataPoint(node);
    nodepoints.push(datapoint);
    node.children().forEach((child) => {
        getnodePoints(child, nodepoints);
    });
};
