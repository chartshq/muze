/* eslint-disable*/
/* eslint-disable*/
let env = muze();
const DataModel = muze.DataModel;
d3.csv('/data/cars.csv', (data) => {
    const schema = [{
        name: 'Name',
        type: 'dimension'
    }, {
        name: 'Maker',
        type: 'dimension'
    }, {
        name: 'Miles_per_Gallon',
        type: 'measure'
    }, {
        name: 'Displacement',
        type: 'measure'
    }, {
        name: 'Horsepower',
        type: 'measure'
    }, {
        name: 'Weight_in_lbs',
        type: 'measure'
    }, {
        name: 'Acceleration',
        type: 'measure'
    }, {
        name: 'Origin',
        type: 'dimension'
    }, {
        name: 'Cylinders',
        type: 'dimension'
    }, {
        name: 'Year',
        type: 'dimension',
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }];;
    // Create an instance of DataModel using the data and schema.
    let dm = new DataModel(data, schema);    
    
    // Get a canvas instance from Muze where the chart will be rendered.
    let canvas = env.canvas();
    const chartConf = {
        axes: {
            x: {
                nice: false,
                name: 'Date'
            }
        }
    };

canvas.rows(['Acceleration'])
        .columns(['Year'])
        .width(800)
        .height(400)
        .data(dm)
        .color('Origin')
        .layers([{
            mark: 'area'
        }])
        .config(chartConf)
        .mount('#chart3');
});

