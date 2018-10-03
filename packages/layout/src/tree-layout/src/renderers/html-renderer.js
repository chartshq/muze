import { HTMLDataAdapter } from '../data-adapters/html-data'
import { Utils } from '../utils/utils'
import { Renderer } from './renderer'
import { LAYOUT_NAME } from '../constants/defaults'
export class HTMLRenderer extends Renderer {
  constructor (data) {
    super()
    this.data = data
    this.coordinates = new HTMLDataAdapter(this.data).getCoordinates()
  }

  createhtml (id) {
    let mainDiv = document.getElementById(id)
    super.initRenderer(mainDiv, this.data) // Initialise node with layout id
    this.parentDiv = this.createAndCustomiseParent()
    this.coordinates.forEach(node => {
      this.parentDiv.appendChild(this.createAndPositionDiv(node))
    })
    mainDiv.appendChild(this.parentDiv)
  }

  createAndPositionDiv (node) {
    let div = document.createElement('div')
    div.style.position = 'absolute'
    div.style.left = node.left + 'px'
    div.style.top = node.top + 'px'
    div.style.height = node.height + 'px'
    div.style.width = node.width + 'px'
    div.style.border = '1px dotted red'
    // Utils.hoverHandler(div)
    div.id = node._id
    return div
  }

  createAndCustomiseParent () {
    let container = Utils.findContainer(this.coordinates)
    let parentDiv = this.createAndPositionDiv(container)
    parentDiv.id = LAYOUT_NAME
    parentDiv.style.position = 'relative'
    return parentDiv
  }
}
