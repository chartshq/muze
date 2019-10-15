/* eslint-disable*/
d3.json('/data/cars.json', (data) => {
    let env = window.muze();
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
    let rootData = new muze.DataModel(data, schema);    
    
    // Get a canvas instance from Muze where the chart will be rendered.
    let canvas = env.canvas();

    canvas = canvas
    .rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Displacement']) // Displacement goes in Y axis
    .size({
        field: 'Cylinders', // Size retinal encoding with Cylinders
        range: [50, 360]
    })
    // .color('Origin') 
	.layers([{
        mark: 'point'
    }])
    .width(500)
    .height(500)
    .data(rootData)
    .title('Scatter plot with retinal encodings', { position: 'top', align: 'left' })
    .subtitle('Acceleration vs Displacement with color and shape axis', { position: 'top', align: 'left' })
    .mount('#chart');
});

