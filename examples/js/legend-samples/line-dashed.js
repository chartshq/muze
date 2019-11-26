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
    var canvas = env.canvas();

    canvas = canvas.rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Year']).color('Origin').layers([{
        mark: 'line',
        connectNullData: true,
        nullDataLineStyle: {
            'stroke-dasharray': '8,4',
            'stroke-width': 5,
            'stroke': 'pink'
        }
    },{
        mark: 'point'
    }]).width(500).height(500).data(rootData).title('Line missing data').mount('#chart').once('canvas.animationend').then(function (client) {
        var element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});

