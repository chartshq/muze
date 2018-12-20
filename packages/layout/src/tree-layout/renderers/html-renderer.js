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
            if (node.hasHost()) {
                const host = node.node();
                this.parentDiv.appendChild(this.createAndPositionDiv({ ...host.boundBox(),
                    id: host.id(),
                    className: node.className() }));
            }
        });
        mainDiv.appendChild(this.parentDiv);
    }

    createAndPositionDiv (config) {
        const { top, left, height, width, className, id } = config;
        const existingDiv = document.getElementById(id);
        const div = existingDiv || document.createElement('div');
        div.style.position = 'absolute';
        div.style.left = `${left}px`;
        div.style.top = `${top}px`;
        div.style.height = `${height}px`;
        div.style.width = `${width}px`;
        div.id = id;
        div.className = className;
        return div;
    }

    createAndCustomiseParent (className) {
        const container = Utils.findContainer(this._coordinates);
        const host = container.node();
        const parentDiv = this.createAndPositionDiv({ ...host.boundBox(),
            id: host.id(),
            className: container.className() });
        parentDiv.className = className;
        parentDiv.style.position = 'relative';
        return parentDiv;
    }

    coordinates () {
        return this._coordinates;
    }
}
