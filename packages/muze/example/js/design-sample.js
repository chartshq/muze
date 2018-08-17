
let env = muze.Muze();
const DataTable = muze.DataTable;
const layerFactory = muze.layerFactory;
const share = muze.operators.share;
const html = muze.operators.html;
const Board = muze.Board;
const board = new Board();
const mountPoint = document.getElementsByClassName('chart')[0];


d3.json('../../data/cars.json', (data) => {
    const jsonData = data,
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
            type: 'measure',
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
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        },

        ];
    let rootData = new DataTable(jsonData, schema);

    rootData = rootData.groupBy(['Origin', 'Year'], {
        Horsepower: 'mean',
        Acceleration: 'mean'
    });
    window.rootData = rootData;
    env = env.data(rootData).minUnitWidth(500);

    layerFactory.composeLayers('plotWithReferenceZone', [
        {
            name: 'line',
            mark: 'plotWithReferenceZone.plot',
            dataSource: 'lineData',
            encoding: {
                x: 'plotWithReferenceZone.encoding.x',
                y: 'plotWithReferenceZone.encoding.y',
                color: 'plotWithReferenceZone.encoding.color'
            },
            transform: {
                type: 'group'
            }
        },
        {
            name: 'line2',
            mark: 'plotWithReferenceZone.plot',
            dataSource: 'dottedData',
            className: 'dotted-line',
            encoding: {
                x: 'plotWithReferenceZone.encoding.x',
                y: 'plotWithReferenceZone.encoding.y',
                color: 'plotWithReferenceZone.encoding.color'
            },
            transform: {
                type: 'group'
            }
        },
        {
            mark: 'bar',
            dataSource: 'referenceZoneData',
            className: 'referenceZone',
            encoding: {
                x: {
                    field: 'refVal',
                },
                x0: {
                    field: 'refVal0'
                }
            },
            axis: {
                x: 'plotWithReferenceZone.encoding.x'
            },
            transform: {
                type: 'identity'
            },
            transition: {
                disabled: true
            },
            calculateDomain: false,
            interactive: false
        },
    ]);

    let canvas = env.canvas();
    const rows = [['Displacement', 'Acceleration']];
    const columns = [['Year']];
    window.canvas = canvas;
    canvas = canvas
            .rows(rows)
            .columns(columns)
            .data(rootData)
            .color('Origin', {
                interpolate: true,
                // scheme: 'interpolateBlues'
                // domain: [130, 2000, 3000, 4481]
            })
            .width(800)
            .height(600)
            .config({
                gridLines: {
                    show: false,
                    horizontal: {
                        show: true
                    }
                }
            })
            // .transform({
            //     referenceZoneData: ['xAxis', (xAxis) => {
            //         let dataArr = [];
            //         dataArr.push({
            //             refVal: new Date(1972, 0, 1),
            //             refVal0: new Date(1975, 0, 1)
            //         });

            //         dataArr.push({
            //             refVal: new Date(1978, 0, 1),
            //             refVal0: xAxis[0].scale.domain()[1]
            //         });
            //         return new DataTable(dataArr, [{
            //             name: 'refVal',
            //             type: 'dimension',
            //             subtype: 'temporal'
            //         }, {
            //             name: 'refVal0',
            //             type: 'dimension',
            //             subtype: 'temporal'
            //         }]);
            //     }],
            //     dottedData: dt => dt.select(fields => fields.Year.value >= new Date(1972, 0, 1) && fields.Year.value <= new Date(1975, 0, 1)),
            //     lineData: dt => dt
            // })
            .layers({
                Acceleration: {
                    mark: 'line',
                    plot: 'line'
                }
            });

    canvas.legend({
        align: 'horizontal',
        width: 50,
        border: 2,
        title: [''],
        item: {
            text: {
                position: 'bottom'
            }
        },
        steps: 6
    })
                    .title('The Muze Project', { position: 'top', align: 'left', })
                    .subtitle('Composable visualisations with a data first approach', { position: 'top', align: 'left' })
                    .mount(mountPoint);
});
