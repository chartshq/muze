import DataModel from 'datamodel';
import { selectElement } from 'muze-utils';
import { layerFactory } from '@chartshq/visual-layer';
import { SimpleAxis } from '@chartshq/muze-axis';
import SampleData from './sampledata';
import VisualUnit from '../src/visual-unit';

const layerDefs = [{
        id: 'point-1',
        mark: 'bar',
        encoding: {
            x: {
                field: 'Cylinders'
            },
            y: {
                field: 'Displacement'
            }
        }
    }, {
        id: 'point-2',
        mark: 'point',
        encoding: {
            x: {
                field: 'Cylinders'
            },
            y: {
                field: 'Displacement'
            }
        }
    }],
    dataModel = new DataModel(...SampleData),
    xAxis = new SimpleAxis({
        id: 'x-axis',
        type: 'band',
        orientation: 'top',
        range: [0, 300],
        padding: 0.2
    }),
    yAxis = new SimpleAxis({
        id: 'y-axis',
        type: 'linear',
        orientation: 'left',
        range: [300, 0]
    }),
    layers = layerDefs.map(def => layerFactory.getLayer(def.mark, [def.id, {
        dataModel,
        config: def,
        axes: {
            x: xAxis,
            y: yAxis
        }
    }])),
    unit = VisualUnit
    .create()
    .config({
        width: 400,
        height: 400
    })
    .dataModel(dataModel)
    .layers(...layers)
    .axes(...[xAxis, yAxis]);

let domain = unit.getAxesDomain();
xAxis.updateDomain(domain['x-axis']);
yAxis.updateDomain(domain['y-axis']);
unit.render(selectElement('body').append('div').style('width', '400px')
                .style('height', '500px')
                .node());
export default unit;
