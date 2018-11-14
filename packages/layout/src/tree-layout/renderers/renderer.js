/* eslint no-useless-constructor: "off" */
/* eslint no-empty-function: "off" */
import { LAYOUT_ID } from '../constants/defaults';

export class Renderer {
    constructor () {}

    initRenderer (node, tree) {
        node.className = LAYOUT_ID;
        node.__logicalTree = tree;
    }
}
