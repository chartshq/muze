import { HTMLDataAdapter } from '../data-adapters/html-data';
import { Utils } from '../utils/utils';
import { Renderer } from './renderer';
import {LAYOUT_ID} from '../constants/defaults'
;

export class HTMLRenderer extends Renderer {
    constructor (data) {
        super();
        this.data = data;
        this.coordinates = new HTMLDataAdapter(this.data).getCoordinates();
        // this.colorPalte = ['#69D2E7', '#A7DBD8', '#E0E4CC', '#F38630', '#FA6900', '#FE4365', '#FC9D9A', '#F9CDAD', '#C8C8A9', '#83AF9B', '#ECD078', '#D95B43', '#C02942', '#542437', '#53777A'];
    }

    createhtml (id,className) {
        const mainDiv = document.getElementById(id);
        super.initRenderer(mainDiv, this.data); // Initialise node with layout id
        this.parentDiv = this.createAndCustomiseParent(className);
        this.coordinates.forEach((node) => {
            if(node.hasHost){
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
        // div.style.backgroundColor = this.colorPalte[Math.floor(Math.random() * Math.floor(this.colorPalte.length - 1))];
        // Utils.hoverHandler(div)
        div.id = node._id;
        return div;
    }

    createAndCustomiseParent (className) {
        const container = Utils.findContainer(this.coordinates);
        const parentDiv = this.createAndPositionDiv(container);
        parentDiv.id = LAYOUT_ID;
        parentDiv.className = className
        parentDiv.style.position = 'relative';
        return parentDiv;
    }
}
