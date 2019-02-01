/* global muze, d3 */

let env = muze();
const ActionModel = muze.ActionModel;
d3.json('./indian-population.json', (population) => {
    d3.json('./sex-ratio.json', (ratio) => {
        const rootData = getData(population.data, ratio.data).select(e => e['State/Country/UT'].value !== 'India');

        env = env
            .data(rootData.sort([['Population 2011']]))
            .minUnitHeight(10)
            .minUnitWidth(10);

        const crosstab = env
            .canvas()
            .columns(['Population 2011'])
            .rows(['State/Country/UT'])
            .color({
                field: 'Gender Population',
                range: ['green', 'green', 'gold', 'red', 'red'].reverse()
            })
            .shape({
                field: 'Gender',
                generator: (val) => {
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(genderShapes[val], 'image/svg+xml');
                    doc.getElementsByTagName('g')[0].setAttribute('transform', 'translate(0 -12.425) scale(.04 .04)');
                    return doc.getElementsByTagName('g')[0];
                }
            })
            .width(900)
            .height(800)
            .layers([{
                mark: 'point',
                transition: {
                    disabled: true
                },
                encodingTransform: (points) => {
                    points.forEach((e) => {
                        if (e._data[3] === 'Men') {
                            e.update.x -= 5;
                        }
                    });
                    return points;
                }
            }, {
                mark: 'text',
                encoding: {
                    text: {
                        field: 'Gender Population',
                        formatter: val => `${Math.round(val * 100)}%`
                    }

                },
                encodingTransform: (points) => {
                    points.forEach((e) => {
                        if (e._data[3] === 'Men') {
                            e.update.x -= 20;
                        } else {
                            e.update.x += 35;
                        }
                    });
                    return points;
                }
            }, {
                mark: 'text',
                source: dt => dt.groupBy(['State/Country/UT']),
                encoding: {
                    text: {
                        field: 'State/Country/UT'
                    },
                    color: {
                        value: () => '#f7cd95'
                    }
                },
                className: 'state-text-layer',

                encodingTransform: (points) => {
                    points.forEach((e) => {
                        e.update.x = 100;
                        e.update['text-anchor'] = 'start';
                    });
                    return points;
                }
            }, {
                mark: 'text',
                source: dt => dt.groupBy(['State/Country/UT']),
                className: 'population-text-layer',
                encoding: {
                    text: {
                        field: 'Population 2011',
                        formatter: val => `Population:  ${val > 1000000 ? Math.round(val / 1000000) : '< 1'} M`
                    },
                    color: {
                        value: () => '#f7cd95'
                    }
                },

                encodingTransform: (points) => {
                    points.forEach((e) => {
                        e.update.x = 800;
                    });
                    return points;
                }
            }])
            .config({
                border: {
                    color: 'white',
                    showValueBorders: {
                        left: false,
                        bottom: false
                    }
                },
                axes: {
                    x: {
                        show: false,
                        domain: [-100000000, 300000000],
                        tickFormat: v => v >= 0 ? v : ''
                    },
                    y: {
                        show: false,
                        tickFormat: str => str.replace(/[_-]/g, ' ')
                    }
                },
                gridLines: {
                    x: {
                        show: false
                    },
                    y: {
                        show: false
                    }
                },
                legend: {
                    size: {
                        show: false
                    },
                    color: {
                        show: false
                    },
                    shape: {
                        show: false
                    }
                }

            })
            .mount('#chart-container');

        ActionModel
                        .for(crosstab)
                        .dissociateSideEffect(['crossline', 'highlight'])
                        .dissociateSideEffect(['tooltip', 'brush,select'])
                        .dissociateSideEffect(['tooltip', 'highlight']);
    });
});
