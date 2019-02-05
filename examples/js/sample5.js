/* eslint-disable */
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
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }
    ];

    const env = muze();
    const DataModel = muze.DataModel;

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.calculateVariable(
        {
            name: 'CountVehicle',
            type: 'measure',
            defAggFn: 'count',
            numberFormat: val => parseInt(val, 10)
        },
        ['Name', () => 1]
    );
    env.data(rootData);

    // line chart
    env.canvas()
        .rows(['CountVehicle'])
        .columns(['Year'])
        .data(rootData)
        .width(450)
        .height(300)
        .title('Line Chart')
        .mount('#chart');

    // stacked bar chart
    env.canvas()
        .rows(['CountVehicle'])
        .columns(['Year'])
        .data(rootData)
        .width(600)
        .color('Origin')
        .layers([{
            mark: 'bar',
            transform: {
                type: 'stack'
            }
        }])
        .height(300)
        .title('Stacked Bar Chart')
        .mount('#chart2');

    // grouped bar chart with line
    env.canvas()
        .rows(['Miles_per_Gallon'])
        .columns(['Year'])
        .data(rootData)
        .width(1050)
        .color('Origin')
        .layers([{
            mark: 'bar'
        }, {
            mark: 'line'
        }])
        .height(300)
        .title('Grouped Bar Chart and Line')
        .mount('#chart3');
});
