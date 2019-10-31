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

    env.canvas()
    .rows(['Acceleration'])
    .columns(['Year'])
    .detail(['Maker'])
    .color({
        field: 'Displacement',
        step: true,
        stops: 5
    })
    .data(rootData)
    .width(500)
    .height(500)
    .mount(mountPoint)
});