let env = muze();
const DataModel = muze.DataModel;
const DateTimeFormatter = muze.utils.DateTimeFormatter;
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const require = muze.utils.require;


d3.csv('../data/twitter-data.csv', (data) => {
    const schema = [
        {
            "name": "time",
            "type": "dimension",
            "subtype": "temporal",
            "format": "%Y-%m-%d %M:%S"
        },
        {
            "name": "impressions",
            "type": "measure"
        },
        {
            "name": "engagements",
            "type": "measure"
        },
        {
            "name": "retweets",
            "type": "measure"
        },
        {
            "name": "favorites",
            "type": "measure"
        },
        {
            "name": "user profile clicks",
            "type": "measure"
        },
        {
            "name": "url clicks",
            "type": "measure"
        },
        {
            "name": "hashtag clicks",
            "type": "measure"
        },
        {
            "name": "detail expands",
            "type": "measure"
        },
        {
            "name": "permalink clicks",
            "type": "measure"
        },
        {
            "name": "follows",
            "type": "measure"
        }
    ];

    let rootData = new DataModel(data, schema);

    env = env.data(rootData)
        .minUnitHeight(40)
        .minUnitWidth(40)
        .width(550)
        .height(300)
        .config({
            autoGroupBy: {
                disabled: true
            },
            axes: {
                y: {
                    showAxisName: false
                },
                x: {
                    showAxisName: false
                }
            },
            legend: {
                color: {
                    show: false
                }
            }
        });

        rootData = rootData.sort([['time', 'asc']]);

        rootData = rootData.calculateVariable({
            name: 'date',
            type: 'dimension',
            subtype: 'temporal'
        }, ['time', (time) => {
            const date = new Date(time);
            return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
        }]);

        rootData = rootData.calculateVariable({
            name: 'count',
            type: 'measure',
            defAggFn: 'count'
        }, ['retweets', () => 0]);

        rootData = rootData.calculateVariable({
            name: 'day',
            type: 'dimension'
        }, ['date', date => DateTimeFormatter.formatAs(date, '%a')]);

        const tweetGroupByDate = rootData.groupBy(['date']);
        const tweetsGroupByDay = rootData.groupBy(['day']);
        const canvases = [];

        let tweetsByDay;
        let tweetsByDate;

        canvases.push(
            tweetsByDate = env.canvas()
                .data(tweetGroupByDate)
                .rows(['count'])
                .columns(['date'])
                .layers([{
                    mark: 'bar'
                }])
                .title('Tweets')
                .subtitle('Drag to filter by time')
                .mount('#chart'),

            tweetsByDay = env.canvas()
                .rows(['day'])
                .columns(['count'])
                .color('day')
                .data(tweetsGroupByDay)
                .subtitle('Select day to filter')
                .title('Tweets In Day of Week')
                .layers([{
                    mark: 'bar',
                    name: 'barLayer',
                    className: 'muze-tweetsByDay'
                }])
                .mount('#chart2'),

            env.canvas()
                .rows(['impressions'])
                .columns(['date'])
                .data(tweetGroupByDate)
                .title('Impressions')
                .mount('#chart3'),

            env.canvas()
                .rows(['engagements'])
                .columns(['date'])
                .data(tweetGroupByDate)
                .title('Engagements')
                .mount('#chart4'),

            env.canvas()
                .rows(['retweets'])
                .columns(['date'])
                .data(tweetGroupByDate)
                .title('Retweets')
                .mount('#chart5'),

            env.canvas()
                .rows(['favorites'])
                .columns(['date'])
                .data(tweetGroupByDate)
                .title('Favorites')
                .mount('#chart6'),

            env.canvas()
                .rows(['user profile clicks'])
                .columns(['date'])
                .data(tweetGroupByDate)
                .title('User Profile Clicks')
                .mount('#chart7'),

            env.canvas()
                .rows(['hashtag clicks'])
                .columns(['date'])
                .data(tweetGroupByDate)
                .title('Hashtag Clicks')
                .mount('#chart8')
        );

        muze.ActionModel.for(...canvases).enableCrossInteractivity()
    .for(tweetsByDay, tweetsByDate)
    .registerPropagationBehaviourMap({
        select: 'filter',
        brush: 'filter'
    })
    .for(tweetsByDay)
    .registerSideEffects(
        class ContributionLayer extends SpawnableSideEffect {
            constructor(...params) {
                super(...params);
                const visualUnit = this.firebolt.context;
                const xField = visualUnit.fields().x[0];
                const yField = visualUnit.fields().y[0];
                this._layers = [];
                const encoding = {
                    x: xField.getMembers()[0],
                    y: yField.getMembers()[0],
                    color: {
                        value: () => '#000'
                    },
                    size: {
                        value: 0.7
                    }
                };
                const barLayers = visualUnit.addLayer({
                    name: 'contributionLayer',
                    mark: 'bar',
                    className: 'muze-contributionLayer',
                    encoding,
                    render: false,
                    source: dm => dm.select(() => false, {
                        saveChild: false
                    })
                });

                this._layers = [...barLayers, ...visualUnit.addLayer({
                    name: 'label',
                    mark: 'text',
                    className: 'textLayer',
                    encoding: {
                        x: xField.getMembers()[0],
                        y: yField.getMembers()[0],
                        color: {
                            value: () => '#fff'
                        },
                        text: xField.getMembers()[0]
                    },
                    render: false,
                    source: (dm) => dm.select(() => false, {
                        saveChild: false
                    }),
                    encodingTransform: require('layers', ['barLayer', (barLayer) => {
                        return (points, layerInst) => {
                            const fieldsConfig = layerInst.data().getFieldsConfig();
                            const yField = layerInst.config().encoding.y.field;
                            const xField = layerInst.config().encoding.x.field;
                            const xFieldIndex = fieldsConfig[xField].index;
                            const yFieldIndex = fieldsConfig[yField].index;
                            const barData = barLayer.data().getData().data;
                            const sourceYFieldIndex = barLayer.data().getFieldsConfig()[yField].index;
                            const sourceXFieldIndex = barLayer.data().getFieldsConfig()[xField].index;
                            points.forEach((point) => {
                                const source = point.source;
                                const totalValue = barData.find(d => d[sourceYFieldIndex] === source[yFieldIndex])[sourceXFieldIndex];
                                point.text = `${((point.source[xFieldIndex] / totalValue) * 100).toFixed(2)}%`;
                                point.update.x += 3;
                            });
                            return points;
                        }
                    }])
                })];
            }

            static formalName() {
                return 'contribution';
            }

            apply(selectionSet) {
                const mergedModel = selectionSet.mergedEnter.model;
                const sideEffectGroup = this.drawingContext().sideEffectGroup;
                const dynamicMarkGroup = this.createElement(sideEffectGroup, 'g', this._layers, '.contribution-layer');

                dynamicMarkGroup.each(function (layer) {
                    layer.mount(this).data(mergedModel);
                });
            }
        }).mapSideEffects({
            filter: {
                effects: ['contribution'],
                preventDefaultActions: true
            }
        })
        .dissociateSideEffect(['anchors', 'highlight']);
});