/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
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
    }];

    let rootData = new DataModel(data, schema)

    rootData.sort([
        ['Cylinders', 'asc'],
        ['Maker', 'desc'],
    ])

    const canvas = env.canvas();
    
    canvas
        .data(rootData)
        .columns(['Cylinders', 'Horsepower'])
        .rows(['Acceleration'])
        .color('Maker')
        .mount('#chart')
        .height(500)
        .title('Charts');
     
    setTimeout(() => {
        canvas.data(canvas.data().select(() => false))
    }, 1000);
    })
})();