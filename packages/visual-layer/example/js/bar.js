/* global window, document, d3 */
const BarLayer = window['visual-layer'].BarLayer;

const Axis = window['muze-axis'];

const DataModel = window.DataModel.default;

d3.json('../data/cars.json', (jsonData) => {
    const schema = [{
        name: 'Name',
        type: 'dimension'
    },
    {
        name: 'Maker',
        type: 'dimension'
    },
    {
        name: 'Miles_per_Gallon',
        type: 'measure'
    },

    {
        name: 'Displacement',
        type: 'measure'
    },
    {
        name: 'Horsepower',
        type: 'measure'
    },
    {
        name: 'Weight_in_lbs',
        type: 'measure'
    },
    {
        name: 'Acceleration',
        type: 'measure'
    },
    {
        name: 'Origin',
        type: 'dimension'
    },
    {
        name: 'Cylinders',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }
    ];   
    const rootData = new DataModel(jsonData, schema).groupBy(['Year'], {});

    const fieldsObj = rootData.getFieldspace().fieldsObj();

    const xAxis = new Axis.SimpleAxis({
        type: 'temporal',
        padding: 0.3
    }, {});
    const yAxis = new Axis.SimpleAxis({
        type: 'linear'
    }, {});
    yAxis.setRange([400, 0]);
    xAxis.setRange([0, 400]);
    yAxis.domain(rootData.getFieldspace().fieldsObj().Displacement.domain());
    xAxis.domain(rootData.getFieldspace().fieldsObj().Year.domain());

    const barLayer = BarLayer.create(rootData, {
        x: xAxis,
        y: yAxis
    }, {
        encoding: {
            x: {
                field: 'Year'
            },
            y: {
                field: 'Displacement'
            }
        }
    }, {
        throwback: {
            commit: () => {}
        }
    });
    barLayer.measurement({
        width: 400,
        height: 400
    });
    barLayer.setDataProps({
        timeDiffs: {
            x: fieldsObj.Year.minimumConsecutiveDifference(),
            y: fieldsObj.Year.minimumConsecutiveDifference()
        }
    });
    barLayer.mount(d3.select('#chart').append('svg').attr('width', 500).attr('height', 500)
                    .append('g').attr('transform', 'translate(25, 0)').node());
});
