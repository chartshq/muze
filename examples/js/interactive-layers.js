/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.csv('/data/seattle-weather.csv', (data) => {
        const schema = [
            {
                "name": "Date",
                "type": "dimension",
                "subtype": "temporal",
                "format": "%Y/%m/%d"
            },
            {
                "name": "Precipitation",
                "type": "measure",
                "defAggFn": "avg"
            },
            {
                "name": "wind",
                "type": "measure"
            },
            {
                "name": "weather",
                "type": "dimension"
            }
        ];

        const SurrogateSideEffect = muze.SideEffects.standards.SurrogateSideEffect;
        const env = muze();
        const DataModel = muze.DataModel;
        const html = muze.Operators.html;
        
        let rootData = new DataModel(data, schema);

        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        rootData = rootData.calculateVariable({
            name: 'Month',
            type: 'dimension'
        }, ['Date', date => (monthNames[new Date(date).getMonth()])]);
        
        const canvas = window.canvas = env.canvas()
        .width(1000)
        .height(400)
        .data(rootData)
        .rows(['Precipitation'])
        .columns(['Month'])
        .layers([{
            mark: 'bar'
        }, {
            mark: 'tick',
            name: 'averageLine',
            className: 'averageLine',
            encoding: {
                x: {
                    field: null
                },
                y: 'Precipitation',
                color: {
                    value: () => '#f71616'
                }
            },
            calculateDomain: false,
            source: dt => dt.groupBy(['']),
            interactive: false
        }])
        .title('Amount of precipitation for every month in the year with their average', {
            align: 'left'
        })
        .subtitle(html`Selecting individual months will give the <b>average</b> for those months`, {
            align: 'left'
        })
        .mount('#chart');
        
        muze.ActionModel.for(canvas)
        .registerSideEffects(
            class AverageLine extends SurrogateSideEffect {
                static formalName() {
                    return 'averageLine';
                }

                apply(selectionSet) {
                    const model = selectionSet.mergedEnter.model;
                    const groupedModel = model.groupBy(['']);
                    const layer = this.firebolt.context.getLayerByName('averageLine');
                    if (!model.isEmpty()) {
                        layer.enableCaching().data(groupedModel);
                    } else {
                        layer.clearCaching();
                    }
                }
            }
        ).mapSideEffects({
            'brush,select': ['averageLine']
        });
    })
})();
