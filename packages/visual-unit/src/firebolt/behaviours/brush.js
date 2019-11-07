import { VolatileBehaviour } from '@chartshq/muze-firebolt';
// import { LAYER_TYPES } from '@chartshq/visual-layer';
import { BRUSH } from '../../enums/behaviours';
/**
 * This is the behaviour for brushing a region on the chart. It accepts a payload
 * which contains the x and y range of the data and other configuration. It will then
 * create a selection box from the range and select the points which fall within the range.
 */
export default class UnitBrushBehaviour extends VolatileBehaviour {
    static formalName () {
        return BRUSH;
    }

    // getAddSetFromCriteria (criteria, propagationInf = {}) {
    //     const context = this.firebolt.context;
    //     const hasBarLayer = !!context.layers().find(layer => layer.config().mark === LAYER_TYPES.BAR_LAYER);
    //     const filteredDataModel = propagationInf.data ? propagationInf.data :
    //         context.getDataModelFromIdentifiers(criteria, 'all', undefined, hasBarLayer);

    //     return {
    //         model: filteredDataModel,
    //         uids: criteria ? (propagationInf.data ? propagationInf.entryRowIds :
    //             filteredDataModel[0].getUids()) : null
    //     };
    // }
}
