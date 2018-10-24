/* eslint no-useless-constructor: "off" */
import { LAYOUT_ID } from '../constants/defaults'

export class Renderer {
  constructor () {}

  initRenderer (node, tree) {
    node.className = LAYOUT_ID
    node.__logicalTree = tree
  }
}
