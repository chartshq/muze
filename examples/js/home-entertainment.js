/* global muze, d3 */

const env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;
const share = muze.Operators.share;
const html = muze.Operators.html;
const ActionModel = muze.ActionModel;
d3.csv('../data/home-entertainment.csv', (data) => {
    const jsonData = data;
    const newData = [];
    const info = ['VHS/UMD', 'DVD', 'Digital'];

    data.forEach((e) => {
        info.forEach((inf) => {
            let value = 0;
            if (inf === 'DVD') {
                value = (+e[inf] + +e['BD/Hi-Def']) * 100 / e.TOTAL;
            } else {
                value = e[inf] * 100 / e.TOTAL;
            }
            newData[newData.length] = {
                year: e.Year,
                entertainmentType: inf,
                value,
                total: e.TOTAL,
                max: value > 50 ? 100 : 0
            };
        });
    });

    const schema = [
        {
            name: 'year',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y'
        },
        {
            name: 'entertainmentType',
            type: 'dimension'
        },

        {
            name: 'value',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'total',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'max',
            type: 'measure',
            defAggFn: 'avg'
        }
    ];
    let rootData = new DataModel(newData, schema);

    rootData = rootData.calculateVariable(
        {
            name: 'start',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y'
        },
        ['year', (year) => {
            if (new Date(year).getFullYear() < 2002) {
                return '1985';
            } else if (new Date(year).getFullYear() < 2014) {
                return '2002';
            } return ' 2014';
        }]
    );
    rootData = rootData.calculateVariable(
        {
            name: 'end',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y'
        },
        ['year', (year) => {
            if (new Date(year).getFullYear() < 2002) {
                return '2002';
            } else if (new Date(year).getFullYear() < 2014) {
                return ' 2014';
            } return '2016';
        }]
    );

    const canvas = env.canvas()
        .rows(['value'])
        .columns([share('year', 'start', 'end')])
        .data(rootData)
        .width(1150)
        .height(300)
        .color({
            field: 'entertainmentType',
            range: ['rgb(207, 97, 217)', 'rgb(247, 135, 0)', 'rgb(0, 182, 189)']
        })
        .transform({
            zones: (dt) => {
                const x = dt.select(fields => (new Date(fields.start.value).getFullYear() === 1985 &&
                    new Date(fields.end.value).getFullYear() === 2002 &&
                    fields.entertainmentType.value === 'VHS/UMD') || (new Date(fields.start.value).getFullYear() === 2002 &&
                        new Date(fields.end.value).getFullYear() === 2014 &&
                        fields.entertainmentType.value === 'DVD') || (new Date(fields.start.value).getFullYear() === 2014 &&
                            new Date(fields.end.value).getFullYear() === 2016 &&
                            fields.entertainmentType.value === 'Digital'))
                    .groupBy(['start', 'end', 'entertainmentType']);

                return x;
            }

        })

        .layers([{
            mark: 'bar',
            className: 'bar-layer',
            encoding: {
                x: 'start',
                x0: 'end',
                y: {
                    field: null
                }
            },
            interactive: false,
            source: 'zones'

        }, {
            mark: 'line',
            interpolate: 'catmullRom',
            encoding: {
                y: 'value',
                x: 'year'
            }
        }])
        .config({
            gridLines: {
                y: {
                    show: true
                },
                x: {
                    show: true
                }
            },
            border: {
                width: 1,
                showValueBorders: {
                    left: false
                    //         bottom: false
                }
            },
            axes: {
                y: {
                    // tickValues: [0, 100],

                    showAxisName: false
                },
                x: {
                    nice: false,
                    tickFormat: (value) => {
                        if (new Date(value).getFullYear() % 5 === 0) {
                            return new Date(value).getFullYear();
                        }
                        return '';
                    },
                    padding: 0,
                    showAxisName: false
                }
            },
            legend: {
                color: {
                    show: false
                }
            },
            interaction: {
                tooltip: {
                    arrow: {
                        disabled: true
                    },
                    offset: {
                        x: 5
                    },
                    mode: 'fragmented',
                    formatter: (dataModel, context) => {
                        const tooltipData = dataModel.getData().data;
                        const fieldConfig = dataModel.getFieldsConfig();

                        let tooltipContent = '';
                        tooltipData.forEach((dataArray) => {
                            const value = fieldConfig.value.index;
                            const entType = fieldConfig.entertainmentType.index;
                            const entVal = dataArray[value];
                            tooltipContent += `<p style = "color: ${context.axes.color[0].getColor(dataArray[entType])}; font-size: 14px;">${entVal.toFixed(2)}%</p>`;
                        });
                        return html`${tooltipContent}`;
                    }
                }
            }
        })

        .mount('#chart');

    ActionModel
                    .for(canvas)
                    .mapSideEffects({
                        highlight: ['flashing-crossline']
                    })
                    .registerSideEffects(class TextSideEffect extends SpawnableSideEffect {
                        static formalName () {
                            return 'flashing-crossline';
                        }

                        apply (selectionSet) {
                            const dataModel = selectionSet.mergedEnter.model;
                            const drawingInf = this.drawingContext();
                            const height = drawingInf.height;
                            const textGroups = this.createElement(drawingInf.htmlContainer, 'div', [1]);
                            if (!dataModel.isEmpty()) {
                                const xValue = dataModel.getData().data[0][dataModel.getFieldsConfig().year.index];
                                const xPx = this.firebolt.context.axes().x[0].getScaleValue(xValue);

                                const textDiv = textGroups.style('position', 'absolute')
                                                .style('left', `${xPx}px`)
                                                .style('top', `${height}px`)
                                                .selectAll('div')
                                                .data([1]);
                                textDiv.enter().append('div').merge(textDiv)
                                                .html(muze.utils.DateTimeFormatter.formatAs(xValue, '%Y'));
                            }

                            return this;
                        }
        });
});
