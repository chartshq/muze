
/* global window, d3 */
const BarLayer = window['visual-layer'].BarLayer;

const Axis = window['muze-axis'];

const DataModel = window.DataModel.default;

d3.csv('../../data/seattle-weather.csv', (jsonData) => {
    const schema = [{
        name: 'date',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y/%m/%d'
    }, {
        name: 'temp_max',
        type: 'measure'
    },
    {
        name: 'temp_min',
        type: 'measure'
    }
    ];
    let rootData = new DataModel(jsonData, schema).select((fields) => fields.date.internalValue <
        new Date(2013, 0, 1).getTime());

    let xAxis = new Axis.SimpleAxis({
        type: 'temporal',
    }, {});
    let yAxis = new Axis.SimpleAxis({
        type: 'linear'
    }, {});
    yAxis.setRange([800, 0]);
    xAxis.setRange([0, 800]);
    let fieldsObj = rootData.getFieldspace().fieldsObj();
    let tempMaxDomain = fieldsObj.temp_max.domain();
    let tempMinDomain = fieldsObj.temp_min.domain();

    yAxis.domain([tempMinDomain[0], tempMaxDomain[1]]);
    xAxis.domain(fieldsObj.date.domain());
    const barLayer = BarLayer.create(rootData, {
        x: xAxis,
        y: yAxis
    }, {
        encoding: {
            y: {
                field: 'temp_max'
            },
            y0: {
                field: 'temp_min'
            },
            x: {
                field: 'date'
            }
        }
    }, {
        throwback: {
            commit: () => {}
        }
    });
    barLayer.measurement({
        width: 800,
        height: 400
    });
    barLayer.setDataProps({
        timeDiffs: {
            x: fieldsObj.date.getMinDiff(),
            y: fieldsObj.date.getMinDiff()
        }
    })
    barLayer.mount(d3.select('body').append('svg').attr('width', 800).attr('height', 800).node());
});
