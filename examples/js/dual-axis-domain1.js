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
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }];
    const dm = new DataModel(data, schema);
    const canvas = env.canvas();
    
    canvas
        .columns(['Displacement', 'Acceleration', 'Origin'])
        .rows(['Cylinders'])
        .minUnitHeight(10)	
        .minUnitHeight(10)		
        .width(1000)
        .height(400)
        .data(dm)
        .mount('#chart')
        .config({
            axes: {
                x: function (rowIndex, columnIndex, context) {
                    console.log(context);
                    if (context.facetsFields[0][0] === 'Origin' && context.facetsFields[1][0] === 'USA') {
                        console.log('object');
                        return {
                            tickFormat: (d) => `${d}K`,
                        }
                    }
                    // Apply to all y-axes
                    return {
                        // name: 'hello world',
                        tickFormat: (d) => `${d / 1000}K`,
                    };
                }
            }
        });
    
        // setTimeout(() => {
        //     canvas
        //         .config({
        //             axes: {
        //                 x: {
        //                     padding: 0.2
        //                 },
        //                 y: function (nameOfVar, rowIndex, columnIndex) {
        //                     // Update only one axis
        //                     if (rowIndex === 1 && columnIndex === 0) {
        //                         return {
        //                             domain: [0, 20000],
        //                             name: 'update 2'
        //                         };
        //                     }
        //                     return null;
        //                 },
        //             }
        //         });
        // }, 2000);
    });
})();
