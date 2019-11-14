/* eslint-disable */


d3.json('../../data/cars-with-null.json', (data) => {
    let jsonData = data;
    const schema = [{
        name: 'Acceleration',
        type: 'measure'
    },
    {
        name: 'Origin',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension'
    }
    ];
    const env = muze();
const DataModel = muze.DataModel;
    let rootData = new DataModel(jsonData, schema);
    const filtered = rootData.select((tuples) => {
        return tuples.Origin.value === 'USA';
    });
    let canvas = env.canvas();

    canvas = canvas
      .rows(['Acceleration']) // Acceleration goes in Y-Axis
      .columns(['Year']) // Horsepower goes in Y-Axis
      .data(rootData)
      .layers([{
        mark : 'area',
        connectNullData: false
      }])
      .color('Origin')
      .width(850)
      .height(650)
      .title('Area')
      .mount("#chart1");
});
d3.json('/data/cars.json', function (data) {
    // load data and schema from url
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
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }];

    var DataModel = window.muze.DataModel;
    var dm = new DataModel(data, schema);
    var html = muze.Operators.html;
    var env = window.muze();
    var canvas = env.canvas();

    canvas.data(dm).width(600).height(400).rows(['Horsepower']).columns(['Weight_in_lbs']).color({
        field: 'Miles_per_Gallon',
        step: true,
        stops: [15, 30]
    }).detail(['Name']).mount('#chart').title('The car acceleration respective to origin', { position: 'bottom', align: 'left' });

    canvas.once('canvas.animationend').then(function (client) {
        var element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});

