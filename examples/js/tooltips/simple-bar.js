var env = window.muze();
var DataModel = window.muze.DataModel;

d3.json('/data/cars-with-null.json', function (data) {
    var schema = [{
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
    var rootData = new DataModel(data, schema);

    // Get a canvas instance from Muze where the chart will be rendered.
    var rows = [['Acceleration']],
        columns = [['Year']];

    env.canvas().rows(rows).columns(columns).data(rootData).layers([{
        mark: 'bar'
    }]).width(800).config({
        legend: {
            position: 'bottom'
        } }).height(600).columns(['Acceleration']).rows(['Year']).layers([{
        mark: 'point'
    }]).shape('Cylinders').mount('#chart').once('canvas.animationend').then(function (client) {
        var element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
