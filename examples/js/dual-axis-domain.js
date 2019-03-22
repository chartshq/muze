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
                    if (context.facetFields[0][0] === 'Origin' && context.facetFields[1][0] === 'USA') {
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
    
        setTimeout(() => {
            canvas
                .config({
                    axes: {
                        x: function (rowIndex, columnIndex, context) {
                            // Update only one axis
                            // Using any of the below if statements
                            // if (rowIndex === 1 && columnIndex === 0) {} OR
                            if (context.axisFields[0] === 'Displacement' && context.facetFields[1][0] === 'USA') {
                                console.log(context);
                                return {
                                    domain: [0, 14000],
                                    name: 'New Name'
                                };
                            }
                            return null;
                        },
                    }
                });
        }, 2000);
    });
})();
