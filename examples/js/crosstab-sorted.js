/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
        let jsonData = data,
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
    window.dm = new DataModel(jsonData, schema);
    // const dm2 = dm.sort([
    //     ['Year', 'desc'],
    //     ['Origin', 'asc']
    // ]);
    const canvas = env.canvas();
    
    canvas
        .data(dm)
        .width(850)
        .height(550)
        // .columns(['Horsepower', 'Origin', 'Maker'])
        // .rows(['Origin', 'Year', 'Maker'])
        .rows(['Horsepower', 'Origin', 'Year', 'Cylinders'])
        // .rows(['Maker', 'Year'])
        .columns(['Horsepower'])
        // .detail(['Name'])
        .mount('#chart')
        .config({
            showHeaders: true,
            sort: {
                Cylinders: 'asc',
                Year: (a, b) => b - a,
                Origin: 'asc',
            },
            axes: {
                x: {
                    name: 'aaa'
                }
            }
        })
    });
}());

