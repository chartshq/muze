/* global muze, d3 */

const DataModel = muze.DataModel;

d3.json('../data/intraday.json', (data) => {
    const schema = [
        {
            name: 'date',
            type: 'dimension',
            subtype: 'temporal'
        },
        {
            name: 'open',
            type: 'measure',
            defAggFn: 'max'
        },
        {
            name: 'high',
            type: 'measure',
            defAggFn: 'max'
        },
        {
            name: 'low',
            type: 'measure',
            defAggFn: 'max'
        },
        {
            name: 'close',
            type: 'measure',
            defAggFn: 'max'
        }, {
            name: 'volume',
            type: 'measure'
        }];

    let rootData = new DataModel(data, schema);
    rootData = rootData.calculateVariable(
        {
            name: 'binnedDate',
            type: 'dimension',
            subtype: 'temporal'
        },
        ['date', (date) => {
            const d = new Date(date);
            const day = d.getDay();
            const diff = d.getDate() - day + (day === 0 ? -6 : 1);
            return new Date(d.setDate(diff));
        }]
  );

    rootData = rootData.select(fields => fields.binnedDate.value < 1539019101000);

    const dm = rootData.groupBy(['binnedDate']);

    const env = muze();
    const canvas = env.canvas();
    canvas
                    .data(dm)
                    .rows(['volume'])
                    .columns(['binnedDate'])
                    .width(1200)
                    .height(400)
                    .config({
                        autoGroupBy: {
                            disabled: true
                        },
                        axes: {
                            // y: {
                            //     numberOfTicks: 5,
                            //     tickFormat: (val) => {
                            //         const v = val / 1000000;
                            //         return v >= 1 ? `${v}M` : val;
                            //     }
                            // },
                            // x: {
                            //     nice: false
                            // }
                        },
                        interaction: {
                            tooltip: {
                                formatter: (tooltipModel) => {
                                    const conf = tooltipModel.getFieldsConfig();
                                    const dataArr = tooltipModel.getData().data;
                                    const DateTimeFormatter = muze.utils.DateTimeFormatter;
                                    return [
                                        ['Date', {
                                            value: DateTimeFormatter.formatAs(dataArr[0][conf.binnedDate.index], '%A %b %d'),
                                            className: 'muze-tooltip-value'
                                        }],
                                        ['Volume', {
                                            value: dataArr[0][conf.volume.index],
                                            className: 'muze-tooltip-value'
                                        }]
                                    ];
                                }
                            }
                        }
                    })
                    .layers([
                        {
                            mark: 'bar'
                        }
                    ])
                    .mount('#chart');

    const overview = env.canvas();

    overview.data(dm)
                    .rows(['high'])
                    .columns(['binnedDate'])
                    .width(1200)
                    .height(200)
                    .config({
                        axes: {
                            x: {
                                nice: false
                            },
                            y: {
                                numberOfTicks: 2
                            }
                        },
                        interaction: {
                            tooltip: {
                                formatter: (tooltipModel) => {
                                    const conf = tooltipModel.getFieldsConfig();
                                    const dataArr = tooltipModel.getData().data;
                                    const DateTimeFormatter = muze.utils.DateTimeFormatter;
                                    return [
                                        ['Date', {
                                            value: DateTimeFormatter.formatAs(dataArr[0][conf.binnedDate.index], '%A %b %d'),
                                            className: 'muze-tooltip-value'
                                        }],
                                        ['High', {
                                            value: dataArr[0][conf.high.index],
                                            className: 'muze-tooltip-value'
                                        }]
                                    ];
                                }
                            }
                        }
                    })
                    .mount('#chart2');

    muze.ActionModel.for(canvas, overview).enableCrossInteractivity()
                    .for(overview)
                    .registerPropagationBehaviourMap({
                        brush: 'filter'
                    });

    const dropdown = document.getElementById('dropdown');

    dropdown.addEventListener('change', () => {
        const fnName = this.value;
        const groupedDm = rootData.groupBy(['binnedDate'], {
            volume: fnName
        });

        muze.ActionModel.for(overview, canvas).enableCrossInteractivity({
            behaviours: {
                // Enable any behaviour on the registered canvases if source canvas and sink canvas is same
                '*': (propPayload, context) => {
                    const propagationCanvas = propPayload.sourceCanvas;
                    const sinkCanvasAlias = context.parentAlias();
                    return propagationCanvas ? propagationCanvas === sinkCanvasAlias : true;
                }
            }
        });
        // muze.ActionModel.for(canvas, overview).enableCrossInteractivity({
        //     behaviours: {
        //         '*': (propPayload, context) => propPayload.sourceCanvas === context.parentAlias() ? true :
        //             [canvas.alias()].indexOf(propPayload.sourceCanvas) !== -1
        //     }
        // });
    });
});
