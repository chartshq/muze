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
    const rootData = new DataModel([], schema);
    env = env
    .data([])
    .minUnitHeight(10)
    .minUnitWidth(10);

    const crosstab = env
    .canvas()
    .rows(['Cylinders', 'Origin'])
    .columns(['Miles_per_Gallon', 'Horsepower'])
    // .data(rootData)
    .color('Acceleration')
    .width(600)
    .height(500)
    .config({
        border: {
            color: '#f6f6f6'
        }
    })
    .title('Avg Mileage of cars by Country faceted by Cylinders')
    .subtitle(
      'Click on the bars to see how the charts in right gets filtered',

    )
    .mount('#chart2');
});
