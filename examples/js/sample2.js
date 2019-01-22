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

const dm = new DataModel(res, schema);
canvas
                .data(dm)
                .width(600)
                .height(400)
                .config({
                    axes: { y: { name: 'Value in percentage' } }
                })
                .rows(['value']) /* Plots against y-axis + provides panel split */
                .columns(['Year'])  /* Plots against x-axis */
                .color({
                    field: 'Media',
                    range: ['red', 'orange', 'yellow', '#33b5e91', '#31a6ea', 'grey', 'red', 'green']
                })
                .layers([
                    {
                        mark: 'line',
                        connectNullData: true
                    },
        { mark: 'point' }
                ])
                .title('Shifts of teenagers in social media usage')
                .mount('#chart-container');

  // Create a new variable which will keep count of cars per cylinder for a particular origin
    const rootData = dataModel.calculateVariable(
        {
            name: 'CountVehicle',
            type: 'measure',
            defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
            numberFormat: val => parseInt(val, 10)
        },
    ['Name', () => 1]
  );

    env = env
    .data(rootData)
    .minUnitHeight(10)
    .minUnitWidth(10);

    const canvas = env
    .canvas();
    window.canvas = canvas
  	.data(rootData)
  	.minUnitHeight(30)
  	.minUnitWidth(10)
  	.width(1200)
  	.height(800)
                    .rows(['Origin'])
      /* Year is a temporal field */
                    .title('asdsd')
                    .subtitle('asdasd')
                    // .config({
                    //     gridLines: {
                    //         show: false
                    //     }
                    // })
                    .layers([{
                        mark: 'arc',
                        encoding: {
                            angle: 'Year',
                            radius: 'Acceleration'
                        }
                    }])
                    .color('Origin')
                    .size('Horsepower')
                    // .detail(['Maker'])

      .columns(['Cylinders']) /* Attaching the canvas to DOM element */
      .mount('#chart2');
});
