/* eslint disable */
let env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    const jsonData = data;
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

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.calculateVariable({
        name: 'date',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }, ['Year', function (d) {
        return d;
    }]);

    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
    const mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    let rows = ['Cylinders', 'Horsepower'],
        columns = ['Origin', 'Year'];
    canvas = env.canvas().rows(rows).columns(columns).height(800).color('Maker').size('Maker').shape('Maker').width(750)
    // {rows}
    .mount(mountPoint);
});

