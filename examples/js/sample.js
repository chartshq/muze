/* global muze, d3 */

let env = muze();
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
            type: 'measure'
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
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }
    ];
    let rootData = new DataModel(jsonData, schema);

    // Create a new variable which will keep count of cars per cylinder for a particular origin
    rootData = rootData.calculateVariable(
        {
            name: 'CountVehicle',
            type: 'measure',
            defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
            numberFormat: val => parseInt(val, 10)
        },
        ['Name', () => 1]
    );

    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);

    const crosstab = env.canvas()
        .rows([['Horsepower']])
        .columns(['Acceleration'])
        .data(rootData)
        // .detail(['Maker'])
        .width(1000)
        .height(400)
        .color({
            field: 'Cylinders',
            domain: ['3', '4', '6', '8', '5']
            // range: ['red', 'blue', 'green', 'yellow']
        })
        .layers([{
            mark: 'point',
            encoding: {
                y: 'Horsepower'
            }
        }, {
            mark: 'point',
            encoding: {
                y: 'Acceleration'
            }
        }])
        .config({
            border: {
                width: 1,
                showValueBorders: {
                    left: 1,
                    right: true
                }
            },
            axes: {
                x: {
                    // show: false
                    // tickValues: ['1960-01-01', '1990-01-01'],
                    // domain: ['1960-01-01', '1990-01-01']
                },
                y: {
                    domain: [0, 305],
                    // tickValues: [60, 190, 220]
                    nice: false
                }
            }
        })
        .mount('#chart');
});
