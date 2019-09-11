/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
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
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }];

    const dm = new DataModel(data, schema);
    const canvas = env.canvas();
    
    canvas
        .data(dm)
        .width(850)
        .height(550)
        .columns(["Year", "Origin", "Name"])
        .rows(["Horsepower"])
        .mount("#chart")
        .title('The car', { position: 'top', align: 'right' })
        .subtitle('The car', { position: 'bottom', align: 'left' })
    });
}());
