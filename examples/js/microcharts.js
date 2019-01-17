/* global muze, d3 */

const env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;

d3.json('../data/by-election.json', (data) => {
    const schema = [
        {
            name: 'No.',
            type: 'measure',
            defAggFn: 'count'
        },
        {
            name: 'Date',
            type: 'dimension',
            subtype: 'temporal',
            format: '%d.%m.%Y'
        },
        {
            name: 'Reason for Vacancy',
            type: 'dimension'
        }
    ];
    const env = muze();
    const DataModel = muze.DataModel;

    let rootData = new DataModel(data, schema);

    rootData = rootData.calculateVariable(
        {
            name: 'Binned_Year',
            type: 'dimension'
        },
        ['Date', (date) => {
            const years = new Date(date).getFullYear();
            const start = Math.ceil(+years / 10) * 10;
            return `${start - 9}-${start}`;
        }]
    );
    rootData = rootData.calculateVariable(
        {
            name: 'Binned_Year_axis',
            type: 'dimension'
        },
        ['Binned_Year', () => 1]
    );
    rootData = rootData.calculateVariable(
        {
            name: 'counter',
            type: 'measure',
            defAggFn: 'sum'
        },
        ['No.', no => no ? 1 : null]
    );
    env.canvas()
                    .rows(['Binned_Year', 'Binned_Year_axis'])
                    .columns(['Reason for Vacancy', 'counter'])
                    .data(rootData.sort([
            ['Binned_Year'],
            ['Reason for Vacancy']
                    ]))
                    .width(700)
                    .layers([{
                        mark: 'bar'
                    }, {
                        mark: 'text',
                        encoding: {
                            text: 'counter',
                            color: { value: () => 'white' }
                        },
                        encodingTransform: (points, layer, dependencies) => {
                            for (let i = 0; i < points.length; i++) {
                                const updateAttrs = points[i].update;
                                const textSize = dependencies.smartLabel.getOriSize(points[i].text);
                                const barWidth = layer.axes().x.getScaleValue(points[i].text);

                                if (barWidth > textSize.width * 2 + 5) {
                                    updateAttrs.x = textSize.width / 2 + 5;
                                } else {
                                    updateAttrs.x += textSize.width / 2 + 5;
                                    points[i].color = 'black';
                                }
                                if (points[i].source[2] === 'Resigned') {
                                    points[i].color = 'black';
                                }
                            }
                            return points;
                        }
                    }])
                    .minUnitWidth(10)
                    .minUnitHeight(10)
                    .height(850)
                    .color({
                        field: 'Reason for Vacancy',
                        domain: ['Died', 'Election voided', 'Expelled', 'Presumed dead', 'Resigned'],
                        range: ['rgb(92, 123, 142)', 'rgb(144, 175, 196)', 'rgb(199, 231, 253)',
                            'rgb(55, 86, 104)', 'rgb(185, 217, 238)']

                    })
                    .config({
                        border: {
                            width: 3,
                            color: 'white',
                            showValueBorders: {
                                top: true,
                                bottom: true,
                                left: true,
                                right: true
                            }
                        },
                        facet: {
                            rows: { verticalAlign: 'middle' }
                        },
                        axes: {
                            y: { show: false, padding: 0.1 },
                            x: { show: false, domain: [0, 17] }
                        },
                        legend: {
                            color: { show: false }
                        }
                    })
                    .title('Politicians used to die in office — now they just resign')
                    .subtitle('Uses data operators with layout variations to achieve tabular view')
                    .mount('#chart');
});

                    // setTimeout(() => {
                    //     canvas.layers([{
                    //         mark: 'bar'
                    //     }]);
                    //     setTimeout(() => {
                    //         canvas.layers([{
                    //             mark: 'point',
                    //             encoding: {
                    //                 y: 'Horsepower',
                    //                 color: {
                    //                     value: '#000'
                    //                 }
                    //             }
                    //         }]);
                    //     }, 5000);
                    // }, 5000);
