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

        type: 'dimension',

        //{subtype}

        // subtype: 'temporal',

        // format: '%Y-%m-%d'

    }];

    var rootData = new DataModel(jsonData, schema);


    env = env.data(rootData)
    window.canvas = env.canvas();

    env.canvas()
        .rows(["Maker"])
        .height(400)
        .columns(['Acceleration'])
        .data(rootData)
        .color({
            field: 'Acceleration',
            stops: 3
        })
        .config({
            legend: {
                position: 'bottom'
            }
        })
        .mount('#chart1')

    env.canvas()
        .rows(["Maker"])
        .height(400)
        .columns(['Acceleration'])
        .data(rootData)
        .color({
            field: 'Acceleration',
            stops: 3
        })
        .config({
            legend: {
                position: 'left'
            }
        })
        .mount('#chart2')

});