/* global d3, muze, document, window */

function createLegend(axes, dir, container, scaleFactor) {
    const keys = ['color', 'shape', 'size'];
    const functions = ['getColor', 'getShape', 'getSize'];
    keys.forEach((key, i) => {
        const axis = axes[key][0];
        if (axis) {
            const uniqueVals = axis.uniqueVals || axis._domain || axis.scale.domain();

            const schema = [
                {
                    name: 'label',
                    type: 'dimension'
                },
                {
                    name: 'color',
                    type: 'dimension'
                },
                {
                    name: 'x',
                    type: 'dimension'
                },
                {
                    name: 'y',
                    type: 'dimension'
                }
            ];


            let data = uniqueVals.map(e => ({
                label: e,
                x: '',
                y: ''
            }));
            data = data.filter((e) => {
                if (e.label !== '') return true;
                return false;
            });
            const pContainer = d3.select(container);
            const env = muze.Muze();
            const DataModel = muze.DataModel;
            const rootData = new DataModel(data, schema);
            const renderer = env
                .data(rootData);
            let legendBoard = renderer.minUnitHeight(10)
            .minUnitWidth(10).canvas();

            legendBoard = legendBoard
                .columns(['label'])
                .rows(['x']);

            if (key === 'color') {
                legendBoard = legendBoard
                    .color('label', {
                        scheme: axis.scheme,
                        domain: axis.domain,
                        interpolate: axis.interpolate
                    });
            }
            if (key === 'shape') {
                legendBoard = legendBoard
                    .shape('label', {
                        range: axis.scale.range(),
                        callback: axis.callback
                    }
                    ).config({
                        axes: {
                            x: {
                                padding: 0
                            }
                        }
                    })
                    .layers({
                        x: {
                            mark: 'point',
                            encoding: {
                                size: {
                                    value: 20,
                                }
                            },
                            className: 'muze-weather-icons'
                        }
                    });
            }
            if (key === 'size') {
                legendBoard = legendBoard
                    .size('label', {
                        range: uniqueVals.map(e => axis[functions[i]](e))
                    })
                    .layers({
                        x: {
                            mark: 'point',
                            scaleFactor: scaleFactor || 100
                        }
                    });
            }
            legendBoard.done();
            setTimeout(() => {
                const heights = {
                    '.legend-container1': 150,
                    '.legend-container2': 60,
                    '.legend-container3': 70,
                    '.legend-container4': 90,
                    '.line-legend': 150,

                };
                const widths = {
                    '.legend-container1': 120,
                    '.legend-container2': 50,
                    '.legend-container3': 40,
                    '.legend-container4': 40,
                    '.line-legend': 170,

                };
                if (container === '.line-legend') {
                    legendBoard.config({
                        axes: {
                            x: {
                                padding: 0.6
                            },
                            y: {
                                padding: 0.7
                            }
                        }
                    });
                }
                legendBoard.height(heights[container])
                                .width(uniqueVals.length * widths[container]);

                legendBoard.mount(pContainer.node());
                legendBoard.getValueMatrix().each((cell) => {
                    cell.unit.fireBolt.disableBehaviouralAction(['tooltip']);
                });
            }, 1000);
        }
    });
}

let env = muze.Muze();
const Board = muze.Board;
const DataModel = muze.DataModel;
let layerFactory = muze.layerFactory;
let share = muze.operators.share;

function createCanvases() {
    return new Promise((resolve) => {
        d3.csv('../../data/manthan.csv', (data) => {
            const jsonData = data;
            const schema = [
                {
                    name: 'date',
                    type: 'dimension',
                },
                {
                    name: 'Temperature',
                    type: 'measure'
                },
                {
                    name: 'units_sales',
                    type: 'measure'
                },
                {
                    name: 'promotions',
                    type: 'dimension'
                },
                {
                    name: 'holiday/events',
                    type: 'dimension'
                },
                {
                    name: 'weather',
                    type: 'dimension'
                },
                {
                    name: 'forecast',
                    type: 'dimension'
                },
            ];
            let dm = new DataModel(jsonData, schema);
            const configX = {
                padding: 0.05
            };
            const configY = {
                padding: 0
            };

            /*
             * ----------------------------------------------
             * Weather chart
             * ----------------------------------------------
             */
            const dmWeather = dm.project(['date', 'weather']);
            dmWeather.generateDimensions([{
                name: 'disWeather'
            }], ['weather'], () => [1]);
            env = env.minUnitHeight(30);
            env = env.minUnitWidth(30);
            env = env.config({
                axes: {
                    x: configX,
                    y: configY
                }
            });
            const canvas0 = env.canvas();
            canvas0.data(dmWeather)
                            .rows(['disWeather'])
                            .columns(['date'])
                            .shape('weather', {
                                callback: (value) => {
                                    if (paths[value]) {
                                        let shape = d3.select('body').append('svg');
                                        shape.html(paths[value]);
                                        return shape.node();
                                    } return 'circle';
                                }
                            })
                            .layers({
                                date: {
                                    mark: 'point',
                                    encoding: {
                                        size: {
                                            value: 20
                                        }
                                    },
                                    className: 'muze-weather-icons'
                                }
                            })
                            .done();
            /*
             * ----------------------------------------------
             * Temperature chart
             * ----------------------------------------------
             */
            const dmTemperature = dm.groupBy(['date'], {
                Temperature: 'mean'
            }).project(['date', 'Temperature']);

            dmTemperature.generateDimensions([{
                name: 'disTemperature'
            }], ['Temperature'], () => [1]);

            const canvas1 = env.canvas();
            canvas1
                            .data(dmTemperature)
                            .rows(['disTemperature'])
                            .columns(['date'])
                            .color('Temperature', {
                                scheme: ['#7ab6df', '#ffff67', '#f7585c'],
                                interpolate: true
                            })
                            .layers({
                                Temperature: {
                                    mark: 'bar'
                                }
                            })
                            .config({
                                axes: {
                                    x: {
                                        padding: 0
                                    },
                                    y: configY
                                }
                            })
                            .done();

            /*
             * ----------------------------------------------
             * Sales chart
             * ----------------------------------------------
             */
            layerFactory.composeLayers(
                'anchorLine', /* name of the custom layer */
                [
                    { /* atomic layer which draws the line between two bubble */
                        name: 'range', /* give a name of this layer */
                        mark: 'line', /* use atomic mark */
                        encoding: { /* transfer  the custom encoding to atomic encoding */
                            x: 'anchorLine.encoding.x', /* value assigned to x on the custom layer will be
                             transfered here */
                            y: 'anchorLine.encoding.y',
                            color: 'anchorLine.encoding.color',
                        }
                    },
                    { /* another atomic layer which draws the top bubble */
                        name: 'highPoint',
                        mark: 'point',
                        encoding: {
                            x: 'anchorLine.encoding.x',
                            y: 'anchorLine.encoding.y',
                            color: 'anchorLine.encoding.color',
                            shape: {
                                value: 'square'
                            }
                        },

                    },
                    // { /* atomic layer which draws the line between two bubble */
                    //     name: 'range2', /* give a name of this layer */
                    //     mark: 'line', /* use atomic mark */
                    //     encoding: { /* transfer  the custom encoding to atomic encoding */
                    //         x: 'anchorLine.encoding.x', /* value assigned to x on the custom layer will be
                    //          transfered here */
                    //         y: 'anchorLine.encoding.y1',
                    //     },
                    //     className: 'yellowLine'
                    // },
                    // { /* another atomic layer which draws the top bubble */
                    //     name: 'highPoint2',
                    //     mark: 'point',
                    //     encoding: {
                    //         x: 'anchorLine.encoding.x',
                    //         y: 'anchorLine.encoding.y1',
                    //         shape: {
                    //             value: 'square'
                    //         }
                    //     },
                    //     className: 'yellowLine'
                    // },
                ]
            );
            // let op = share('units_sales', 'forecast_units_sales');
            const dmSales = dm.project(['date', 'units_sales', 'forecast']);

            const canvas2 = env.canvas()
                .data(dmSales)
                .rows(['units_sales'])
                .columns(['date'])
                .color('forecast', {
                    scheme: ['#730dcd', '#f3b302']
                })
                .layers({
                    units_sales: {
                        mark: 'anchorLine',
                    },
                })
                .done();

            /*
             * ----------------------------------------------
             * Promotions chart
             * ----------------------------------------------
             */
            // @warn not like the idea of keeping the measure just for aggregation
            const dmPromo = dm
                .groupBy(['date', 'promotions'], {
                    unit_sales: 'mean'
                })
                .project(['date', 'promotions'])
                .generateDimensions([{
                    name: 'disPromo'
                }], ['promotions'], () => ['Promotions']);

            const canvas3 = env.canvas()
                .data(dmPromo)
                .rows(['disPromo'])
                .columns(['date'])
                .color('promotions', {
                    domain: ['high', 'low', ''],
                    scheme: ['#a181dd', '#63a634', '#fff'],
                    interpolate: false
                })
                .layers({
                    Temperature: {
                        mark: 'bar'
                    }
                })
                .done();

            /*
             * ----------------------------------------------
             * Holidays chart
             * ----------------------------------------------
             */
            // @warn not like the idea of keeping the measure just for aggregation
            const dmHolidays = dm
                .groupBy(['date', 'holiday/events'], {
                    unit_sales: 'mean'
                })
                .project(['date', 'holiday/events'])
                .generateDimensions([{
                    name: 'holiday'
                }], ['holiday/events'], () => ['Holidays/Events']);

            const canvas4 = env.canvas()

                .data(dmHolidays)
                .rows(['holiday'])
                .columns(['date'])
                .color('holiday/events', {
                    domain: ['holiday', 'events', ''],
                    scheme: ['#5471cc', '#bb12ca', 'white'],
                    interpolate: false
                })

                .done();
            const y = d3.select('body').append('div')
                .attr('class', 'line-legend')
                .style('width', `${window.innerWidth}px`);
            const x = d3.select('body').append('div')
                .attr('class', 'legend')
                .style('width', `${window.innerWidth}px`)
                .selectAll('.legend-container')
                .data(['Weather', 'Average Temperature', 'Promotions', 'Holiday/Events'])
                .enter()
                .append('div')
                .attr('class', 'legend-container');
            x.append('div').attr('class', 'legend-header').html(d => d);
            x.append('div').attr('class', (d, i) => `legend-container${i + 1}`);

            canvas0.getRetinalAxes().then((axes) => {
                createLegend(axes, '', '.legend-container1', 100);
            });
            canvas1.getRetinalAxes().then((axes) => {
                createLegend(axes, '', '.legend-container2', 100);
            });
            canvas2.getRetinalAxes().then((axes) => {
                createLegend(axes, '', '.line-legend', 100);
            });
            canvas3.getRetinalAxes().then((axes) => {
                createLegend(axes, '', '.legend-container3', 100);
            });
            canvas4.getRetinalAxes().then((axes) => {
                createLegend(axes, '', '.legend-container4', 100);
            });

            resolve([canvas0, canvas1, canvas2, canvas3, canvas4]);
        });
    });
}


(async () => {
    // get all the immidiate renderable canveses
    let canvases = await createCanvases();

    setTimeout(() => {
        // create vertical stack layout
        window.vStack = Board.Layout.vStack()
            .source(canvases)
            .resolve({
                xAxis: layoutMatrix => layoutMatrix.map((e, i) => {
                    if (i === layoutMatrix.length - 1) {
                        return {
                            show: true
                        };
                    }
                    return {
                        show: false
                    };
                }),
                yAxis: layoutMatrix => layoutMatrix.map((e, i) => {
                    if (i > 1) {
                        return {
                            show: true
                        };
                    }
                    return {
                        show: false
                    };
                }),
                interaction: {
                    tooltip: {
                        model: data => [
                            [null, data.date],
                            [{
                                icon: 'shape'
                            }, data.weather],
                            ['Average Temperature :', data.Temperature],
                            ['Promotions :', data.promotions],
                            ['Holiday/Events : ', data['holiday/events'] || '-']
                        ],
                    }
                }
            })
            .config({
                dist: [0.75, 1, 2.5, 1, 3],
                gutter: 0.0001
            })
            .width(2500)
            .height(300)

            .mount(document.getElementsByClassName('chart-container')[0]);
    }, 1000);
})();

