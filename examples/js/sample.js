/* global muze, d3 */

const env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;

d3.json('../data/cars.json', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'Name',
            type: 'dimension'
        },
        {
            name: 'Maker',
            type: 'dimension'
        },
        {
            name: 'Miles_per_Gallon',
            type: 'measure',
            defAggFn: 'avg'
        },

        {
            name: 'Displacement',
            type: 'measure'
        },
        {
            name: 'Horsepower',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'Weight_in_lbs',
            type: 'measure'
        },
        {
            name: 'Acceleration',
            type: 'measure',
            defAggFn: 'sum'
        },
        {
            name: 'Origin',
            type: 'dimension'
        },
        {
            name: 'Cylinders',
            type: 'dimension'
        },
        {
            name: 'Year',
            type: 'dimension'
            // subtype: 'temporal',
            // format: '%Y-%m-%d'
        }
    ];

        // Create a new DataModel instance with data and schema
    const dm = new DataModel(data, schema);
    // Create a canvas from the global environment
    const canvas = env.canvas();
   // DataModel instance is created from https://www.charts.com/static/cars.json data,
// https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.

    // DataModel instance is created from https://www.charts.com/static/cars.json data,
// https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.

// DataModel instance is created from https://www.charts.com/static/cars.json data,
// https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.

// DataModel instance is created from https://www.charts.com/static/cars.json data,
// https://www.charts.com/static/cars-schema.json schema and assigned to variable dm.

    canvas
                    .data(dm)
                    .minUnitHeight(30)
                    .minUnitWidth(10)
                    .width(1200)
                    .height(400)
                    .rows(['Horsepower'])
                    .color('Origin')
                    .title('Chart is very good')
                    .subtitle('JJHfhhdfdhhkjk')
                    .columns(['Year']) /* Year is a temporal field */
                    .mount('#chart-container'); /* Attaching the canvas to DOM element */
    window.canvas = canvas;
});

                    // setTimeout(() => {
                    //     canvas.layers([{
                    //         mark: 'bar'
                    //     }]);
                    //     setTimeout(() => {
                    //         canvas.layers([{
                    //             mark: 'point',
                    //             encoding: {
                    //                 y: 'Horsepower',
                    //                 color: {
                    //                     value: '#000'
                    //                 }
                    //             }
                    //         }]);
                    //     }, 5000);
                    // }, 5000);
