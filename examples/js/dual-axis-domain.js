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
        .rows(['Acceleration', 'Weight_in_lbs']) // Acceleration goes in Y-Axis
        .columns(['Cylinders']) // Cylinders goes in X-Axis
        .minUnitHeight(10)	
        .minUnitHeight(10)		
        .width(1000)
        .height(400)
        .data(dm)
        // .rows(['Horsepower'])
        // .columns(['Cylinders'])
        // .detail(['Name'])
        .mount('#chart')
        .config({
            axes: {
                x: {
                    name: 'x-axis'
                    // specificAxes: (rowIndex, columnIndex, name) => {
                    //     if (rowIndex === 0 && columnIndex === 1) {
                    //         return {
                    //             name: 'hello world',
                    //             tickValues: ['USA']
                    //         };
                    //     }
                    // }
                },
                y: {
                    // tickFormat: (d) => `${d}M`,
                    name: 'default',
                    // domain: [0, 1000],
                    specificAxes: (rowIndex, columnIndex, name) => {
                        /* method to overwrite axis config,
                        callback params - rowIndex, columnIndex, axesName */
                        if (rowIndex === 1 && columnIndex === 0) {
                            return {
                                tickFormat: (d) => `${d}s`,
                                domain: [0, 700],
                                name: 'hello'
                            };
                        }
                        return null;
                    }
                }
            }
        });

        setTimeout(() => {
            canvas
                .config({
                    axes: {
                        y: {
                            // name: 'adarsh',
                            // domain: [0, 500],
                            specificAxes: (rowIndex, columnIndex, name) => {
                                if (rowIndex === 0 && columnIndex === 0) {
                                    return {
                                        name: 'hello aga1in',
                                        // tickFormat: (d) => `${d}l`,
                                        // showAxisName: false,
                                        domain: [0, 900],
                                    };
                                }
                            }
                        }
                    }
                });
        }, 2000);
    });
}());
