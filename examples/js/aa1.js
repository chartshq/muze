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
    let dm = new DataModel(jsonData, schema);

    dm = dm.groupBy(['Year', 'Origin', 'Cylinders', 'Maker'], {
        Horsepower: 'mean',
        Acceleration: 'mean'
    });

    env = env.data(dm).minUnitHeight(40).minUnitWidth(40);
    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    var canvas2 = env.canvas();
    var canvas3 = env.canvas();
    var rows = ['Origin'],
        columns = ['Cylinders'];
    canvas = canvas.rows(rows).columns(columns).data(dm).color('Maker').layers([{
        mark: 'arc'
    }]).height(300).width(300).config({
        scrollBar: {
            horizontal: {
                align: 'bottom'
            }
        }
    }).mount('#chart')
    
    // canvas
    //     .data(dm)
    //     .width(600)
    //     .height(400)
    //     .rows(['Horsepower'])
    //     .columns(['Cylinders'])
    //     // .detail(['Name'])
    //     .mount('#chart') /* Attaching the canvas to DOM element */
    //     .config({
    //         axes: {
    //             y: {
    //                 interpolator: 'pow',
    //                 exponent: 2,
    //             },
    //         }
    //     })

    //     setTimeout(() => {
    //         canvas
    //             .config({
    //                 axes: {
    //                     y: {
    //                         tickFormat: (d) => `${d/1000}K`,
    //                         interpolator: 'linear',
    //                         base: 2,
    //                     }
    //                 }
    //             });
    //     }, 2000);
    });
}());
