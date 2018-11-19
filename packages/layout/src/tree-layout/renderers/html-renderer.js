import { HTMLDataAdapter } from '../data-adapters/html-data';
import { Utils } from '../utils';
import { Renderer } from './renderer';

export class HTMLRenderer extends Renderer {
    constructor (data) {
        super();
        this._data = data;
        this._coordinates = new HTMLDataAdapter(this._data).getCoordinates();
    }

    createhtml (mount, className) {
        const mainDiv = mount;
        super.initRenderer(mainDiv, this._data); // Initialise node with layout id
        this.parentDiv = this.createAndCustomiseParent(className);
        this._coordinates.forEach((node) => {
            if (node.hasHost) {
                this.parentDiv.appendChild(this.createAndPositionDiv(node));
            }
        });
        mainDiv.appendChild(this.parentDiv);
    }

    createAndPositionDiv (node) {
        const div = document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${node.left}px`;
        div.style.top = `${node.top}px`;
        div.style.height = `${node.height}px`;
        div.style.width = `${node.width}px`;
        div.id = node._id;
        div.className = node.className;
        return div;
    }

    createAndCustomiseParent (className) {
        const container = Utils.findContainer(this._coordinates);
        const parentDiv = this.createAndPositionDiv(container);
        parentDiv.className = className;
        parentDiv.style.position = 'relative';
        return parentDiv;
    }

    coordinates () {
        return this._coordinates;
    }
}
