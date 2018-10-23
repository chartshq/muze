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

    const DataModel = muze.DataModel;

        // Create a new DataModel instance with data and schema
    const dm = new DataModel(data, schema);

        // Create a global environment to share common configs across charts
    const env = muze();
        // Create a canvas from the global environment
    const canvas = env.canvas();
    canvas
                    .data(dm)
                    .rows(['Acceleration']) // Year goes in y-axis
                    .columns(['Year']) // Acceleration goes in x-axis
                    .color({
                        field: 'Horsepower',
                        stops: 5
                    })
                    .config({
                        axes: { // Dont show the y axis as we are showing the labels on the bars itself
                            y: {
                                // tickSize: 150
                                // show: false
                            }
                        },
                        border: { // Hide the layout borders for better visibility
                            showValueBorders: {
                                left: false,
                                bottom: false
                            }
                        },
                        legend: {
                            position: 'bottom'
                        }
                    })
                    .layers([{
                        mark: 'bar', // Use that custom mark to pass encoding values
                        encoding: {
                            axisText: {
                                field: 'Year'
                            },
                            valueText: {
                                field: 'Acceleration'
                            }
                        }

                    }])
                    .width(600)
                    .height(500)
                    .title('Bar chart with axis labels inside the plot area', { position: 'top', align: 'center' })
                    .subtitle('Acceleration vs Year', { position: 'top', align: 'center' })
                    .mount('#chart'); // Set the chart mount point
});

