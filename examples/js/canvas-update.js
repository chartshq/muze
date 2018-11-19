/* global muze, d3 */

let env = muze();
const DataModel = muze.DataModel;

d3.csv('../data/coffee.csv', (data) => {
    const jsonData = data;
    const schema = [{
        name: 'Market',
        type: 'dimension'
    },
    {
        name: 'Product',
        type: 'dimension'
    },
    {
        name: 'Product Type',
        type: 'dimension'
    },

    {
        name: 'Revenue',
        type: 'measure'
    },
    {
        name: 'Expense',
        type: 'measure'
    },
    {
        name: 'Profit',
        type: 'measure'
    },
    {
        name: 'Order Count',
        type: 'measure'
    }];

    let dataModel = new DataModel(jsonData, schema);

    dataModel = dataModel.calculateVariable({
        name: 'revenueParameter',
        type: 'measure',
        defAggFn: 'max'
    }, ['Profit', () => 225000]);

    dataModel = dataModel.calculateVariable({
        name: 'profitParameter',
        type: 'measure',
        defAggFn: 'max'
    }, ['Profit', () => 110000]);

    dataModel = dataModel.groupBy(['Market', 'Product']);

    dataModel = dataModel.calculateVariable({
        name: 'quadrant',
        type: 'dimension'
    }, ['profitParameter', 'revenueParameter', 'Revenue', 'Profit', (pp, rp, r, p) => {
        if (p >= pp && r >= rp) {
            return 'Upper Right';
        } else if (p < pp && r >= rp) {
            return 'Upper Left';
        } else if (p < pp && r < rp) {
            return 'Lower Left';
        }
        return 'Lower Right';
    }]);

    env = env
        .data(dataModel);

    const share = muze.Operators.share;

    muze.layerFactory.composeLayers('quadrantLayer', [{
        name: 'xLine',
        mark: 'tick',
        encoding: {
            x: 'quadrantLayer.encoding.x',
            y: {
                field: null
            },
            color: {
                value: () => '#000'
            }
        },
        source: dt => dt.groupBy([''])
    }, {
        mark: 'tick',
        name: 'yLine',
        encoding: {
            y: 'quadrantLayer.encoding.y',
            x: {
                field: null
            },
            color: {
                value: () => '#000'
            }
        },
        source: dt => dt.groupBy([''])
    }]);

    const crosstab = env
        .canvas()
        .rows([share('Revenue', 'revenueParameter')])
        .columns([share('Profit', 'profitParameter')])
        .width(600)
        .height(500)
        .config({
            axes: {
                x: {
                    name: 'Profit'
                },
                y: {
                    name: 'Revenue'
                }
            },
            autoGroupBy: {
                disabled: true
            }
        })
        .layers([{
            mark: 'point',
            encoding: {
                x: 'Profit',
                y: 'Revenue'
            }
        },
        {
            mark: 'tick',
            encoding: {
                x: 'profitParameter',
                y: {
                    field: null
                },
                color: {
                    value: () => '#000'
                }
            },
            axis: {
                x: 'Profit'
            },
            source: dt => dt.groupBy([''])
        }, {
            mark: 'tick',
            encoding: {
                y: 'revenueParameter',
                x: {
                    field: null
                },
                color: {
                    value: () => '#000'
                }
            },
            axis: {
                y: 'Revenue'
            },
            source: dt => dt.groupBy([''])
        }])
        .shape('quadrant')
        .detail(['Market', 'Product', 'quadrant'])
        .mount('#chart');
});
