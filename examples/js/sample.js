/* eslint-disable */

let env = muze();
let DataModel = muze.DataModel,
    share = muze.operators.share;


d3.json('../data/cars.json', (data) => {
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

    let rootData = new DataModel(jsonData, schema);
    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
    let mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    let rows = ['Miles_per_Gallon']
        columns = ['Origin'];
    canvas
        .rows(rows)
        .config({
            axisFrom: {
                row: 'right'
            }
        })
        .color('Acceleration')
        .columns(columns)
        .data(rootData)
        .width(600)
        .height(500)
     
        .title('The Muze Project', { position: "top", align: "left", })
        .subtitle('Composable visualisations with a data first approach',
            { position: "top", align: "left" })
        .mount(document.getElementsByTagName('body')[0]);
});
