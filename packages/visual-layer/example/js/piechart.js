
/* global window, document, d3 */
const ArcLayer = window['visual-layer'].ArcLayer;

const DataModel = window.DataModel.default;

d3.json('../../data/cars.json', (jsonData) => {
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
        type: 'measure',
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
        type: 'dimension'
    },
    ];
let rootData = new DataModel(jsonData, schema).groupBy(['Year'], {});

    const barLayer = ArcLayer.create(rootData, {}, {
        encoding: {
            angle: {
                field: 'Year'
            },
            radius: {
                field: 'Displacement'
            },
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

    barLayer.mount(d3.select('#chart').append('svg').attr('width', 500).attr('height', 500)
        .append('g').attr('transform', 'translate(25, 0)').node());
});
