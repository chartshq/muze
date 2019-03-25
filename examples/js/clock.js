const env = muze();
const DataModel = muze.DataModel;

const jsonData = [];
for (let i = 0; i <= 60; i++) {
    jsonData.push({
        name: i === 0 ? 60 : i
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
}];
const rootData = new DataModel(jsonData, schema2);

const makeZeroSixty = (val) => {
    if (val == 0) {
        return '60';
    } return val;
};

const tickMap = {
    hours: {
        low: {
            stroke: 'black',
            width: '2px',
            inner: 0,
            outer: -100
        },
        middle: {
            stroke: '#c41400',
            width: '6px',
            inner: 20,
            outer: -100
        },
        high: {
            stroke: 'black',
            width: '10px',
            inner: 20,
            outer: -100
        }
    },
    minutes: {
        low: {
            stroke: 'black',
            width: '2px',
            inner: 0,
            outer: -70
        },
        middle: {
            stroke: '#c41400',
            width: '6px',
            inner: 20,
            outer: -70
        },
        high: {
            stroke: 'black',
            width: '10px',
            inner: 20,
            outer: -70
        }
    }
};

const generateTick = (type, tickType, source) => {
    const tick = tickMap[type][tickType];
    return {
        mark: 'tick',
        source,
        encoding: {
            angle: 'name',
            color: {
                value: () => tick.stroke
            }
        },
        interpolate: 'catmullRom',
        encodingTransform: (points) => {
            points.forEach((point) => {
                point.update.radius0 = point.update.radius - 40 - 60;
                point.update.radius = tick.inner;
                point.style['stroke-width'] = tick.width;
                point.style['stroke-linecap'] = 'round';
                point.style['stroke-opacity'] = '1';
            });
            return points;
        }
    };
};

window.canvas = env.canvas()
        .data(rootData)
        .rows([])
        .columns([])
        .height(500)
        .width(1200)
        .config({
            axes: {
                radius: {
                    range: range => [range[0], range[1] - 15]
                }
            }
        })
        .transform({
            bigTicks: dm => dm.select(fields => fields.name.value % 5 == 0),
            smallTicks: dm => dm.select(fields => fields.name.value % 5 !== 0),
            tickHours: dm => dm.select(fields => fields.name.value === `${(new Date().getHours() % 12 * 5)}`),
            tickMinutes: dm => dm.select(fields => fields.name.value === `${makeZeroSixty(new Date().getMinutes())}`),
            tickSeconds: dm => dm.select(fields => fields.name.value === `${makeZeroSixty(new Date().getSeconds())}`)
        })
        .config({
            axes: {
                radius: () => ({
                    range: defRange => [defRange[0], defRange[1] - 20]
                })
            }
        })
        .layers([
            {
                mark: 'text',
                encoding: {
                    angle: 'name',
                    text: {
                        field: 'name',
                        formatter: (val) => {
                            if (val % 5 === 0) {
                                return val / 5;
                            } return '';
                        }

                    },
                    color: {
                        value: () => 'black'
                    }
                },
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius += 10;
                    });
                    return points;
                }
            },
            {
                mark: 'tick',
                source: 'bigTicks',
                encoding: {
                    angle: 'name',
                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 40;
                    });
                    return points;
                }
            },

            {
                mark: 'tick',
                source: 'smallTicks',
                encoding: {
                    angle: 'name',
                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 20;
                    });
                    return points;
                }
            },
            generateTick('hours', 'low', 'tickHours'),
            generateTick('hours', 'high', 'tickHours'),
            generateTick('hours', 'middle', 'tickHours'),
            generateTick('minutes', 'low', 'tickMinutes'),
            generateTick('minutes', 'high', 'tickMinutes'),
            generateTick('minutes', 'middle', 'tickMinutes'),
            // {
            //     mark: 'tick',
            //     source: 'tickMinutes',
            //     encoding: {
            //         angle: 'name',

            //         color: {
            //             value: () => 'black'
            //         }
            //     },
            //     interpolate: 'catmullRom',
            //     encodingTransform: (points) => {
            //         points.forEach((point) => {
            //             point.update.radius0 = point.update.radius - 40 - 30;
            //             point.update.radius = 0;
            //             point.style['stroke-width'] = '2px';
            //         });
            //         return points;
            //     }
            // },
            {
                mark: 'tick',
                source: 'tickSeconds',
                encoding: {
                    angle: 'name',

                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 45;
                        point.update.radius = 0;
                    });
                    return points;
                }
            }
        ])
        .mount('#chart');

setInterval(() => {
    canvas.transform({
        bigTicks: dm => dm.select(fields => fields.name.value % 5 === 0),
        smallTicks: dm => dm.select(fields => fields.name.value % 5 !== 0),
        tickHours: dm => dm.select(fields => fields.name.value === `${(new Date().getHours() % 12 * 5)}`),
        tickMinutes: dm => dm.select(fields => fields.name.value === `${makeZeroSixty(new Date().getMinutes())}`),
        tickSeconds: dm => dm.select(fields => fields.name.value === `${makeZeroSixty(new Date().getSeconds())}`)
    });
}, 500);
