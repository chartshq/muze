/* eslint disable */
let env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    const jsonData = data,
        schema = [{
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

    const rootData = new DataModel(jsonData, schema);
    window.rootData = rootData;
    env = env.data(rootData).minUnitHeight(100).minUnitWidth(20);
    const mountPoint = document.getElementsByClassName('chart')[0];
    const canvas = env.canvas();
    window.canvas = canvas;
    let rows = ['Displacement'],
        columns = ['Year'];
    canvas
        .rows(rows)
        .columns(columns)
        .width(600)
        .height(600)
        .data(rootData.groupBy(['Year', 'Origin']))
        .color('Origin')
        .config({
            legend: {
                position: 'bottom'
            }
        })
        .mount(document.getElementById('chart'));
});
