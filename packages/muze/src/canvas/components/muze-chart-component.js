import { LayoutComponent } from '../../../../layout/src/tree-layout';

export default class MuzeComponent extends LayoutComponent {
    getLogicalSpace () {
        return {
            width: this.boundBox.width,
            height: this.boundBox.height
        };
    }

    setSpatialConfig (conf) {
        this.boundBox.top = conf.y;
        this.boundBox.left = conf.x;
        this.boundBox.newDimensions = {
            width: conf.width,
            height: conf.height
        };
        this.renderAt = conf.renderAt;
    }

    getBoundBox () {
        return this.boundBox;
    }
}
