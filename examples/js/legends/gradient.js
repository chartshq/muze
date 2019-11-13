/* eslint-disable */
// var env = muze();
// var DataModel = muze.DataModel;
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
        type: 'dimension',
        //{subtype}
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }];
    var rootData = new DataModel(jsonData, schema);

    env = env.data(rootData)
    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();

    rootData = rootData.groupBy(['Year', 'Origin'], {
        Horsepower: 'mean',
        Acceleration: 'mean'
    });

    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    var rows = [['Acceleration']],
        columns = [['Year']];

    env.canvas()
    .rows(rows)
    .columns(columns)
    .data(rootData)
    .layers([{
        mark: 'bar'
    }])
    .width(800)
    .config({
        legend: {
            position: 'bottom'
    }})
    .height(600)
    .color({
        field: 'Horsepower',
        stops:6
    })
    .mount('#chart6')

    env.canvas()
    .rows(rows)
    .columns(columns)
    .data(rootData)
    .layers([{
        mark: 'point'
    }])
    .width(800)
    .config({
        legend: {
            position: 'top'
    }})
    .height(600)
    .size({
        field: 'Horsepower'
    })
    .mount('#chart5')

    env.canvas()
    .rows(rows)
    .columns(columns)
    .data(rootData)
    .layers([{
        mark: 'point'
    }])
    .width(800)
    .config({
        legend: {
            position: 'right'
    }})
    .height(600)
    .color({
        field: 'Horsepower',
        stops:6
    })
    .mount('#chart5')

    env.canvas()
    .rows(rows)
    .columns(columns)
    .data(rootData)
    .layers([{
        mark: 'bar'
    }])
    .width(800)
    .config({
        legend: {
            position: 'left'
    }})
    .height(600)
    .color({
        field: 'Horsepower',
        stops:6
    })
    .mount('#chart5')
});