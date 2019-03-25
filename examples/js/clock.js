const env = muze();
const DataModel = muze.DataModel;

const jsonData = [];
for (let i = 1; i <= 60; i++) {
    jsonData.push({
        name: i === 60 ? 60 : i
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
            stroke: 'white',
            width: '4px',
            inner: 0,
            outer: -120
        },
        middle: {
            stroke: '#c41400',
            width: '8px',
            inner: 30,
            outer: -120
        },
        high: {
            stroke: 'white',
            width: '12px',
            inner: 30,
            outer: -120
        }
    },
    minutes: {
        low: {
            stroke: 'white',
            width: '4px',
            inner: 0,
            outer: -70
        },
        middle: {
            stroke: '#c41400',
            width: '8px',
            inner: 30,
            outer: -70
        },
        high: {
            stroke: 'white',
            width: '12px',
            inner: 30,
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
        interactive: false,
        interpolate: 'catmullRom',
        encodingTransform: (points) => {
            points.forEach((point) => {
                point.update.radius0 = point.update.radius + tick.outer;
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
                                // return val / 5;
                            } return '';
                        }

                    },
                    color: {
                        value: () => 'white'
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
                        value: () => 'white'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 40;
                        point.style['stroke-width'] = '4px';
                        point.style['stroke-linecap'] = 'round';
                    });
                    return points;
                }
            },

            // {
            //     mark: 'tick',
            //     source: 'smallTicks',
            //     encoding: {
            //         angle: 'name',
            //         color: {
            //             value: () => 'white'
            //         }
            //     },
            //     interpolate: 'catmullRom',
            //     encodingTransform: (points) => {
            //         points.forEach((point) => {
            //             point.update.radius0 = point.update.radius - 20;
            //         });
            //         return points;
            //     }
            // },
            generateTick('hours', 'low', 'tickHours'),
            generateTick('hours', 'high', 'tickHours'),
            generateTick('hours', 'middle', 'tickHours'),
            generateTick('minutes', 'low', 'tickMinutes'),
            generateTick('minutes', 'high', 'tickMinutes'),
            generateTick('minutes', 'middle', 'tickMinutes'),

            {
                mark: 'tick',
                source: 'tickSeconds',
                encoding: {
                    angle: 'name',

                    color: {
                        value: () => 'white'
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
            },
            {
                mark: 'arc',
                source: dt => dt.select((e, i) => i === 0),
                encoding: {
                    radius: {
                        value: () => 8
                    },
                    color: {
                        value: () => 'white'
                    }
                },
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius = 0;
                    });
                    return points;
                }
            },
            {
                mark: 'arc',
                source: dt => dt.select((e, i) => i === 0),
                encoding: {
                    radius: {
                        value: () => 6
                    },
                    color: {
                        value: () => '#c41400'
                    }
                },
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius = 0;
                    });
                    return points;
                }
            },
            {
                mark: 'arc',
                source: dt => dt.select((e, i) => i === 0),
                encoding: {
                    radius: {
                        value: () => 226
                    },
                    radius0: {
                        value: () => 226 - 40
                    },
                    color: {
                        value: () => '#ffffff11'
                    }
                },
                interactive: false,
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.radius = 0;
                    });
                    return points;
                }
            }

        ])
        .mount('#chart');

setInterval(() => {
    // canvas.transform({
    //     bigTicks: dm => dm.select(fields => fields.name.value % 5 === 0),
    //     smallTicks: dm => dm.select(fields => fields.name.value % 5 !== 0),
    //     tickHours: dm => dm.select(fields => fields.name.value === `${(new Date().getHours() % 12 * 5)}`),
    //     tickMinutes: dm => dm.select(fields => fields.name.value === `${makeZeroSixty(new Date().getMinutes())}`),
    //     tickSeconds: dm => dm.select(fields => fields.name.value === `${makeZeroSixty(new Date().getSeconds())}`)
    // });
}, 500);
