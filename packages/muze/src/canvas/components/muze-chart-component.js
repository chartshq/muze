import { LayoutComponent } from '../../../../layout/src/tree-layout';

export default class MuzeComponent extends LayoutComponent {
    getLogicalSpace () {
        const { width, height } = this.boundBox();
        return { width, height };
    }

    setSpatialConfig (conf) {
        this.boundBox({ top: conf.y, left: conf.x });
        this.newDimensions = {
            width: conf.width,
            height: conf.height
        };
        this.renderAt(conf.renderAt);
    }

    getBoundBox () {
        return this.boundBox();
    }
}
