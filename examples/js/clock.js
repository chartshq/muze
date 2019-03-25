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
                        value: () => '#000'
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
            {
                mark: 'tick',
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
                        point.update.radius0 = point.update.radius - 40 - 60;
                        point.update.radius = 0;
                        point.style['stroke-width'] = '4px';
                    });
                    return points;
                }
            },
            {
                mark: 'tick',
                source: 'tickMinutes',
                encoding: {
                    angle: 'name',

                    color: {
                        value: () => 'black'
                    }
                },
                interpolate: 'catmullRom',
                encodingTransform: (points) => {
                    points.forEach((point) => {
                        point.update.radius0 = point.update.radius - 40 - 30;
                        point.update.radius = 0;
                        point.style['stroke-width'] = '2px';
                    });
                    return points;
                }
            },
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

