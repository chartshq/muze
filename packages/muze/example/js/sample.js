(function () {
    let env = muze();
    let DataModel = muze.DataModel,
        share = muze.operators.share,
        html = muze.operators.html,
        actionModel = muze.ActionModel;
    layerFactory = muze.layerFactory;
    const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;

    d3.json('../../data/cars.json', (data) => {
        const jsonData = data,
            // schema = [{
            //     name: 'date',
            //     type: 'dimension',
            //     subtype: 'temporal',
            //     format: '%Y/%m/%d'
            // }, {
            //     name: 'temp_max',
            //     type: 'measure'
            // }];
            schema = [{
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
                type: 'measure'
            },
            {
                name: 'Weight_in_lbs',
                type: 'measure'
            },
            {
                name: 'Acceleration',
                type: 'measure'
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

        layerFactory.composeLayers('heatMapText', [
            {
                name: 'bar',
                mark: 'bar',
                encoding: {
                    y: 'heatMapText.encoding.y',
                    x: 'heatMapText.encoding.x'
                }
            },
            {
                name: 'text',
                mark: 'text',
                encoding: {
                    x: 'heatMapText.encoding.x',
                    y: 'heatMapText.encoding.y',
                    text: 'heatMapText.encoding.text',
                    color: 'heatMapText.encoding.color'
                }
            }
        ]);
        let rootData = new DataModel(jsonData, schema);

        rootData = rootData.groupBy(['Origin', 'Year', 'Cylinders'], {
            Horsepower: 'mean',
            Acceleration: 'mean'
        });
        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        const canvas2 = env.canvas();
        const canvas3 = env.canvas();

        window.onresize = () => {
            canvas.width(window.innerWidth - 30)
            .height(window.innerHeight);
        };
        let rows = ['Origin', 'Acceleration'],
            columns = ['Year'];
        
        canvas = canvas
			.rows(rows)
			.columns(columns)
            .data(rootData)
			.width(600)
            .height(1000)
            .size('Origin')
            .layers([{
                mark: 'point',
                // transform: {
                //     type: 'group'
                // },
                encoding: {
                    // color: {
                    //     value: () => 'red'
                    // }
                } }])
            //     // transform: {
            //     //     type: 'group'
            //     // },
            //     // encoding: {
            //     //     text: {
            //     //         field: 'Horsepower',

            //     //     },
            //         // color: {
            //         //     value: () => 'red'
            //         // }

            //     // }
            // }])
            // .color({
            //     field: 'Year',
            //     // scheme: 'interpolateGreens',

            //     // steps: [500, 1000, 2000, 3000, 4000]
            //     // interpolate: true
            // })
            // .size('Year')
            // .shape('Year')
                .color({
                    field: 'Origin',
                    // scheme: ['R//ed']
                    scheme: ['#fff333', 'Red', 'hsla(100,44%, 55%,1)']
                    // interpolate: true
                })
                // .size('Origin')
            .config({
                facetConfig: {
                    rows: {
                        verticalAlign: 'middle'
                    }
                },
                // gridBands: {
                //     y: { show: true }
                // },
                border: {
                    width: 2
                },
                axes: {
                    x: {
                        showAxisName: true,
                        // padding: 0,
                        axisNamePadding: 20

                    },
                    y: {
                        showAxisName: true,
                        // padding: 0,
                        // name: 'Acceleration per year',
                        axisNamePadding: 20
                    }
                }
            });

  

                        .title('The Muze Project', { position: 'top', align: 'left' })
                        // .subtitle('Composable visualisations with a data first approach', { position: 'top', align: 'left' })
                        .mount(document.getElementsByTagName('body')[0]);
    });
}());
