/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData = data;
    const schema = [{
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
        type: 'measure',
        numberFormat: (val) => "$" + val
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

    // jsonData = [
    //     { Origin: "India", Year: "2018-02-22", Acceleration: 1000 },
    //     { Origin: "India", Year: "2018-03-12", Acceleration: 2000 },
    //     { Origin: "India", Year: "2018-04-01", Acceleration: 3000 },
    //     { Origin: "Japan", Year: "2018-02-22", Acceleration: 4000 },
    //     { Origin: "Japan", Year: "2018-03-12", Acceleration: 2000 },
    //     { Origin: "Japan", Year: "2018-04-01", Acceleration: 4000 },
    // ];
    jsonData = [];
    for (let i = 0; i <= 60; i++) {
        jsonData.push({
            name: i === 0 ? 60 : i,
            // tick: i === 0 ? 1 : 0
        });
    }
    const schema2 = [{
        name: 'name',
        type: 'dimension'
    }, {
        name: 'hour',
        type: 'measure'
    }, {
        name: 'tick',
        type: 'measure'
    }]
    let rootData = new DataModel(jsonData, schema2);
    // rootData = rootData.groupBy(["Origin", "Year"], {
    //     Acceleration: "avg"
    // });

    const makeZeroSixty = (val)=>{
        if(val == 0){
            return '60'
        } return val
    }
    console.log(new Date().getHours()%12 * 5)

    window.canvas = env.canvas()
        .data(rootData)
        .rows([])
        .columns([])
        // .color('name')
        .height(500)
        .width(1200)
        .transform({
            bigTicks: (dm) => dm.select((fields) => fields.name.value %5 == 0),
            smallTicks: (dm) => dm.select((fields) => fields.name.value %5 !== 0),
            tickHours: (dm) => dm.select((fields) => fields.name.value === `${(new Date().getHours()%12 * 5)}`),
            tickMinutes: (dm) => dm.select((fields) => fields.name.value === `${makeZeroSixty(new Date().getMinutes())}`),
            tickSeconds: (dm) => dm.select((fields) => fields.name.value === `${makeZeroSixty(new Date().getSeconds())}`)
        })
        .config({
            axes: {
                radius: () => {
                    return {
                        range: (defRange) => {
                            return [defRange[0], defRange[1] - 140]
                        }
                    }
                }
            }
        })
        // .size('Displacement')
        .title("Maker wise average car Acceleration")
        .layers([
            {
                mark: "text",
                // source: 'bigTicks',
                encoding: {
                    angle: 'name',
                    text: {
                        field: 'name',
                        formatter: (val)=>{
                            if(val%5 === 0){
                                return val/5;
                            } return '';
                        }

                    },
                    color: {
                        value: () => '#000'
                    }
                },
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius += 55;
                    });
                    return points;
                }
            },
            {
                mark: "tick",
                // name: 'bigTicks',
                source: 'bigTicks',
                encoding: {
                    angle: 'name',
                    // radius: {
                    //     field: 'Horsepower'
                    // },
                    color: {
                        value: () => 'black'
                    }
                },
                // outerRadius: 140,
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 += 40;
                    });
                    return points;
                }
            },
            {
                mark: "tick",
                // name: 'smallTicks',
                source: 'smallTicks',
                encoding: {
                    angle: 'name',
                    // radius: {
                    //     field: 'Horsepower'
                    // },
                    color: {
                        value: () => 'black'
                    }
                },
                // outerRadius: 140,
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 += 40;
                        point.update.radius += 20;
                    });
                    return points;
                }
            },
            {
                mark: "tick",
                // name: 'hourTick',
                source: 'tickHours',
                encoding: {
                    angle: 'name',
                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 50;
                        point.update.radius = 0;
                        point.style['stroke-width'] = '4px';
                    });
                    return points;
                }
            },
            {
                mark: "tick",
                // name: 'tickMinutes',
                source: 'tickMinutes',
                encoding: {
                    angle: 'name',
                    // radius: {
                    //     field: 'Horsepower'
                    // },
                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius -20;
                        point.update.radius = 0;
                        point.style['stroke-width'] = '2px';
                        console.log(point)
                    });
                    return points;
                }
            },
            {
                mark: "tick",
                // name: 'tickSeconds',
                source: 'tickSeconds',
                encoding: {
                    angle: 'name',
                    // radius: {
                    //     field: 'Horsepower'
                    // },
                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 5;
                        point.update.radius = 0;
                    });
                    return points;
                }
            }
        ])
        .mount('#chart');

        setInterval(() => {
            canvas.transform({
                bigTicks: (dm) => dm.select((fields) => fields.name.value %5 === 0),
                smallTicks: (dm) => dm.select((fields) => fields.name.value %5 !== 0),
                tickHours: (dm) => dm.select((fields) => fields.name.value === `${(new Date().getHours()%12 * 5)}`),
                tickMinutes: (dm) => dm.select((fields) => fields.name.value === `${makeZeroSixty(new Date().getMinutes())}`),
                tickSeconds: (dm) => dm.select((fields) => fields.name.value === `${makeZeroSixty(new Date().getSeconds())}`)
            })
        }, 500);
    });