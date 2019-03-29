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
            // subtype: 'temporal',
            // format: '%Y-%m-%d'
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
    rootData = rootData.calculateVariable(
        {
            name: 'date',
            type: 'dimension',
            subtype: 'temporal',
            format: "%Y-%m-%d"
        },
        ['Year', (d) => d]
    );

    env.data(rootData);

    // line chart
    window.canvas = env.canvas()
        .columns(['Year', 'Cylinders', 'Origin'])
        .rows(['Horsepower'])
        .width(1200)
        .height(500)
        .data(rootData)
        // .layers([{
        //     mark: 'line'
        // }])
        .title('Line Chart')
        .mount('#chart');

    // stacked bar chart
    env.canvas()
        .rows([])
        .columns([])
        .width(600)
        .color('Origin')
        .layers([{
            mark: 'arc',
            encoding: {
                angle: 'Maker',
                radius: 'Acceleration'
            },
            transform: {
                type: 'stack'
            }
        }, {
            mark: 'text',
            encoding: {
                angle: 'Maker',
                radius: 'Acceleration',
                text: {
                    field: 'Acceleration',
                    formatter: (d) => d.toFixed(2)
                },
                rotation: {
                    value: () => 40
                }
            }
        }, {
            mark: 'tick',
            encoding: {
                angle: 'Maker',
                radius0: {
                    value: (d) => {
                        return d.radius + 20;
                    }
                },
                radius: 'Acceleration',
                text: {
                    field: 'Acceleration',
                    formatter: (d) => d.toFixed(2)
                },
                rotation: {
                    value: () => 40
                }
            }
        }])
        .height(500)
        .title('Stacked Bar Chart')
        .mount('#chart2');

    // grouped bar chart with line
    env.canvas()
        .rows(['Miles_per_Gallon'])
        .columns(['Year'])
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
