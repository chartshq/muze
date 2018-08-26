const env = muze();
const { DataModel } = muze;
const mountPoint = document.getElementById('chart');

const layerFactory = muze.layerFactory;
layerFactory.composeLayers('compositePoint', [
    {
        name: 'simplepoint',
        mark: 'point',
        encoding: {
            x: 'compositePoint.encoding.x',
            y: 'compositePoint.encoding.y'
                // color: 'compositePoint.encoding.color',
        }
    },
    {
        name: 'averageLine',
        mark: 'tick',
        source: 'roundedYears',
        className: 'averageLine',
        encoding: {
            y: 'roundedYearsMeasure',
            x: null
        },
        calculateDomain: false,
        axis: {
            y: 'sesNew'
        }
    },
    {
        name: 'averageText',
        mark: 'text',
        source: 'roundedYears',
        className: 'averageText',
        encoding: {
            y: 'roundedYearsMeasure',
            x: null,
            text: 'roundedYearsMeasure',
            color: {
                value: () => '#fff'
            },
            background: {
                enabled: true
            }
        },
        encodingTransform: (points) => {
            for (let i = 0; i < points.length; i++) {
                points[i].update.x += 50;
            }
            return points;
        },
        axis: {
            y: 'sesNew'
        },
            // encodingTransform: (points, layer, dependencies) => {
            //     let width = layer.measurement().width;
            //     let smartLabel = dependencies.smartLabel;
            //     for (let i = 0; i < points.length; i++) {
            //         let size = smartLabel.getOriSize(points[i].text);
            //         points[i].update.x = width - 5;
            //         points[i].textanchor = 'end';
            //         points[i].update.y -= size.height / 2;
            //     }
            //     return points;
            // },
        calculateDomain: false
    }
]);

fetch('../data/largest_districts.tsv')
                .then(res => res.text())
                .then((data) => {
                    const schema = [
                        {
                            name: 'leaidC',
                            type: 'dimension'
                        },
                        {
                            name: 'newname',
                            type: 'dimension'
                        },
                        {
                            name: 'nyt_abbrev',
                            type: 'dimension'
                        },

                        {
                            name: 'ses',
                            type: 'measure'
                        },
                        {
                            name: 'totavg',
                            type: 'measure'
                        },
                        {
                            name: 'mnav3poolgcs',
                            type: 'measure'
                        },
                        {
                            name: 'mnav8poolgcs',
                            type: 'measure'
                        },
                        {
                            name: 'mngrdpoolgcs',
                            type: 'measure'
                        },
                        {
                            name: 'stfips',
                            type: 'measure'
                        },
                        {
                            name: 'countyid',
                            type: 'dimension'
                        },
                        {
                            name: 'inc50all',
                            type: 'measure'
                        }
                    ];

                    let dm = new DataModel(data, schema, {
                        dataFormat: 'DSVStr',
                        fieldSeparator: '\t'
                    });
                    dm = dm.calculateVariable({
                        name: 'sesNew',
                        type: 'measure'
                    }, ['ses', d => -d]);
                    dm = dm.calculateVariable({
                        name: 'mnav3poolgcsNew',
                        type: 'measure'
                    }, ['mnav3poolgcs', d => -d]);
                    dm = dm.calculateVariable({
                        name: 'roundedYears',
                        type: 'dimension'
                    }, ['ses', d => Math.ceil(d)]);
                    const altdm = dm.groupBy(['roundedYears']).calculateVariable({
                        name: 'roundedYearsMeasure',
                        type: 'measure'
                    }, ['roundedYears', d => +d]);
                    console.log(altdm.getData().data);
    // dm =dm.groupBy(['roundedYears']).calculateVariable({
    //   name: 'roundedYearsMeasure',
    //   type: 'measure'
    // }, ['roundedYears', (d)=>+d])
                    console.log(dm.getData().data);

    // dm = dm.select(f=> f.totavg.value>10000)
                    const rows = ['sesNew'];
                    const columns = ['mnav3poolgcsNew'];
                    const canvas = env.canvas();

    // or  215, 23.5 80
    // hover : 51 94.9 53.7
                    canvas
                                    .rows(rows)
                                    .columns(columns)
                                    .detail(['Newname'])
                                    .data(dm)
                                    .transform({
                                        roundedYears: d => d.groupBy(['roundedYears']).calculateVariable({
                                            name: 'roundedYearsMeasure',
                                            type: 'measure'
                                        }, ['roundedYears', d => +d])
                                    })
                                    .layers([
                                        {
                                            mark: 'compositePoint',
                                            encoding: {
                                                x: 'mnav3poolgcsNew',
                                                y: 'sesNew'
                                            },
                                            interaction: {
                                                highlight: [{
                                                    type: 'fill',
                                                    intensity: [-164, 71.4, -26.3, 0]
                                                }, {
                                                    type: 'stroke',
                                                    intensity: [0, 0, 0, 0.25]
                                                }]
                                            }
                                        }
        // {
        //   mark:'tick',
        //   source: 'roundedYears',
        //   encoding : {
        //     text : 'roundedYearsMeasure',
        //     x: null,
        //     y:'roundedYearsMeasure'
        //   }
        // }
                                    ])
                                    .config({
                                        border: {
                                            showValueBorders: {
                                                left: false,
                                                bottom: false
                                            }
                                        },
                                        legend: {
                                            size: {
                                                show: false
                                            }
                                        },
                                        axes: {
                                            y: {
            // tickValues: [-3, -2, -1, 0, 1, 2,3, 4],
                                                show: false
                                            },
                                            x: {
                                                show: false
                                            }
                                        }
                                    })
                                    .color({
                                        value: '#c0cad8'
                                    })
                                    .width(700)
                                    .height(500)
                                    .size({
                                        field: 'totavg',
                                        range: [25, 2500]
                                    }
      )
                                    .mount(mountPoint);
                })
                .catch(console.log.bind(console));
