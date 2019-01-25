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
    const dm = new DataModel(jsonData, schema);
    const canvas = env.canvas();
    
    canvas
        .data(dm)
        .width(400)
        .height(400)
        .rows(['Horsepower'])
        .columns(['Year'])
        // .detail(['Name'])
        .mount('#chart'); /* Attaching the canvas to DOM element */
        
        canvas.config({
            axes: {
                x: {
                    // tickFormat: d => `${d / 1000}K`,
                    tickFormat: d => d.getFullYear(),
                    labels: {
                        rotation: 55,
                    },
                },
                y: {
                    tickFormat: d => `${d / 1000}K`,
                    name: 'hello world'
                }
            },
          });
          setTimeout(() => {
            canvas
        .rows([[],['Horsepower']])
              .config({
                axes: {
                x: {
                    // tickFormat: d => d
                    tickFormat: d => `${d.getDay()}K`,
                    // showAxisName: false,
                    // tickFormat: d => d,
                },
                  y: {
                    tickFormat: d => `${d / 100}`,
                    name: 'hello asdf',
                    interpolator: 'log',
                    base: 2,
                  }
                },
              });
          }, 2000);
    });
}());
