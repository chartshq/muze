/* eslint no-undef: "off" */
import { DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH } from '../constants/defaults'

export class Utils {
  static onHover (event) {
    this.highLightNode(event.target, DEFAULT_BORDER_COLOR, DEFAULT_BORDER_WIDTH)
  }

  static offHover (event) {
    this.unHighLightNode(event.target)
  }

  static htmlHover (node, color, width) {
    color = color !== undefined ? color : DEFAULT_BORDER_COLOR
    width = width !== undefined ? width : DEFAULT_BORDER_WIDTH
    node.style.outline = `${color} solid ${width}`
  }

  static htmlUnHover (node) {
    node.style.outline = ''
  }

  static highLightNode (node, color, width) {
    let renderer = global.__renderer

    switch (renderer) {
      case 'html' :
        this.htmlHover(node, color, width)
        break
    }
  }

  static unHighLightNode (node) {
    let renderer = global.__renderer
    switch (renderer) {
      case 'html' :
        this.htmlUnHover(node)
        break
    }
  }

  static hoverHandler (container) {
    container.addEventListener('mouseover', this.onHover.bind(this))
    container.addEventListener('mouseleave', this.offHover.bind(this))
  }

  static isDOMElement (element) {
    return element instanceof Element
  }

  static getID (element) {
    return element.id
  }

  static findContainer (data) {
    return data.filter(coordinate => { return coordinate.parent == null })[0]
  }
  /**
   * static method to remove the div
   * @param  {} divId - div ID to be removed.
   */
  static removeDiv (divId) {
    if (document.getElementById(divId) !== null) { document.getElementById(divId).remove() }
  }
}
