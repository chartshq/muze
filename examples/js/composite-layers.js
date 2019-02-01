 /* global muze, d3 */

const env = muze();
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
            type: 'measure',
            defAggFn: 'avg'
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
    const rootData = new DataModel(jsonData, schema);

    const layerFactory = muze.layerFactory;

    const simpleBar = {
        name: 'simplebar',
        mark: 'bar',
        encoding: {
            x: 'compositeBar.encoding.x',
            y: 'compositeBar.encoding.y'
        }
    };

    const simpleText = {
        name: 'simpletext',
        mark: 'text',
        encoding: {
            x: 'compositeBar.encoding.x',
            y: 'compositeBar.encoding.y',
            text: 'compositeBar.encoding.y'
        }
    };

    const simplePoint = {
        name: 'simplePoint',
        mark: 'text',
        encoding: {
            x: 'compositePoint.encoding.x',
            y: {
                field: 'compositePoint.encoding.y.field'
            },
            text: {
                field: 'compositePoint.encoding.y.field',
                formatter: val => Math.round(val),
                background: {
                    value: () => '#000'
                }
            },
            color: {
                value: () => '#fff'
            }
        },
        transform: {
            type: 'stack'
            // groupBy: 'simplePoint.encoding.color.field'
        }
    };

    const simpleTick = {
        name: 'simpleTick',
        mark: 'tick',
        encoding: {
            x: 'compositePoint.encoding.x',
            y: 'compositePoint.encoding.y',
            color: 'compositePoint.encoding.color'
        }
    };
    layerFactory
                    .composeLayers('compositeBar', [
                        simpleBar, simpleText
                    ]);
    layerFactory
                    .composeLayers('compositePoint', [
                        simpleTick, simplePoint
                    ]);

    const rows = [['Horsepower'], ['Acceleration']];
    env.canvas()
                    .data(rootData)
                    .width(600)
                    .height(400)
                    // .config({ axes: { y: { domain: [0, 1000] } } })
                    // .layers([{
                    //     mark: 'compositeBar' /* For the primary Y axis */
                    //     // encoding: {
                    //     //     y: 'Acceleration'
                    //     // }
                    // },
                    // // {
                    // //     mark: 'compositePoint', /* For the secondary Y axis */
                    // //     // encoding: {
                    // //     //     y: 'Displacement',
                    // //     //     color: {
                    // //     //         value: () => 'red' /* For differentiating layers */
                    // //     //     }
                    // //     // }
                    // // }
                    // ])
                    // .config({
                    //     interaction: {
                    //         tooltip: {
                    //             fields: ['Maker', 'Origin', 'Displacement']
                    //         }
                    //     }
                    // })
                    .rows(rows)
                    .columns(['Year'])
                    .color('Origin')
                    .layers([{
                        mark: 'bar',
                        encoding: {
                            y: 'Horsepower'
                        }
                    }, {
                        mark: 'compositePoint',
                        encoding: {
                            y: 'Acceleration'
                        }
                    }])
                    // .detail(['Maker'])
                    .mount('#chart');
});

