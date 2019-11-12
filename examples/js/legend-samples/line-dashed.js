/* eslint-disable*/
let env = muze();
const DataModel = muze.DataModel;
d3.json('/data/cars-with-null.json', (data) => {
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
        type: 'dimension'
    }];
    // Create an instance of DataModel using the data and schema.
    let rootData = new DataModel(data, schema);

    // Get a canvas instance from Muze where the chart will be rendered.
    let canvas = env.canvas();

    canvas = canvas
    .rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Year'])
    .color('Origin')
	.layers([{
        mark: 'line',
        connectNullData: true,
        nullDataLineStyle:{
            'stroke-dasharray' : ("8,4"),
            'stroke-width': 4,
            'stroke': 'pink'
        }
    }])
    .width(500)
    .height(500)
    .data(rootData)
    .title('Line Chart With Connected Null Data', { position: 'top', align: 'left' })
    .mount('#chart');
});

