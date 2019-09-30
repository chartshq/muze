/* eslint-disable */
var env = muze();
var DataModel = muze.DataModel;
d3.json('../data/cars.json', function (data) {
    var jsonData = data,
        schema = [{
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
        //{subtype}
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }];
    var rootData = new DataModel(jsonData, schema);

    env = env.data(rootData)
    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    env.canvas()
  	.data(rootData)
  	.width(600)
  	.height(400)
  	.rows(['Weight_in_lbs'])
  	.columns(['Horsepower'])
  	.detail(['Name'])
    .size('Cylinders')
    .subtitle('size: dimension')
    .mount(mountPoint)

    env.canvas()
    .rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Horsepower']) // Displacement goes in Y axis
    .detail(['Maker'])
    .size({
        field: 'Displacement', // Size retinal encoding with Cylinders
        range: [0,1000]
    })
    .data(rootData)
    .layers([{
        mark: 'point'
    }])
    .width(500)
    .height(500)
    .subtitle('size: measure + range')
    .mount('#chart1')

    env.canvas()
    .rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Horsepower']) // Displacement goes in Y axis
    .detail(['Maker'])
    .size({
        field: 'Displacement', // Size retinal encoding with Cylinders
        // intervals: 5
    })
    .data(rootData)
    .layers([{
        mark: 'point'
    }])
    .width(500)
    .height(500)
    .mount('#chart2')

    env.canvas()
    .rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Year']) // Displacement goes in Y axis
    .size({
        field: 'Cylinders', // Size retinal encoding with Cylinders
        intervals: 5
    })
    .data(rootData)
    .layers([{
        mark: 'point'
    }])
    .width(500)
    .height(500)
    .mount('#chart3')
});