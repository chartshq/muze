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
            type: 'dimension'
            // subtype: 'temporal',
            // format: '%Y-%m-%d'
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
        .columns(['Year'])
        .data(rootData)
        // .detail(['Maker'])
        .width(600)
        .height(400)

        .config({
            border: {
                width: 1,
                showValueBorders: {
                    left: 1,
                    right: true
                }
            },
            axes: {
                y: {
                    // show: false
                    // tickValues: ['1960-01-01', '1990-01-01'],
                    // domain: ['1960-01-01', '1990-01-01']
                    // domain: [0, 200],
                    tickFormat: (val, i, labels) => {
                        if (i === 0 || i === labels.length - 1) {
                            // return new Date(val).getFullYear();
                            return val;
                        }
                        return '';
                    }
                },
                x: {
                    // domain: ['1950-01-01', '1999-01-01'],
                    tickFormat: (val, i, labels) =>
                        // if (i === 0 || i === labels.length - 1) {
                            // return new Date(val).getFullYear();
                             `${val}`,                        // }
                        // return '';

                    // tickValues: [60, 190, 220]
                    nice: false
                }
            }
        })
        .mount('#chart');
});
