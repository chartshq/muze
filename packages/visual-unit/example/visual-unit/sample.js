
/* eslint-disable */
let DataModel = window['visual-unit'].DataModel,
    VisualUnit = window['visual-unit'].VisualUnit,
    SimpleAxis = window['visual-unit'].SimpleAxis,
    ColorAxis = window['visual-unit'].ColorAxis;

function renderVisualUnit (dataModel) {
    dataModel = dataModel.select((fields, i) => {
        return new Date(+fields.date).getFullYear() === 2002;
    });
    let axes = {
        x: new SimpleAxis({
            id: 'x-axis',
            type: 'temporal',
            range: [0, 600],
            orientation: 'horizontal',
            padding: '0.2'
        }),
        y: new SimpleAxis({
            id: 'y-axis',
            type: 'linear',
            range: [350, 0],
            orientation: 'vertical'
        }),
        color: new ColorAxis({
            type: 'ordinal',
            range: []
        })
    };
    let unit = VisualUnit.create()
        .dependencies({
            stylesheet: 'asd'
        })
        .config({
            width: 600,
            height: 350
        })
        .dataModel(dataModel)
        .axes({
            x: [axes.x],
            y: [axes.y],
            color: [axes.color]
        })
        .layerDef([{
            mark: 'ohlc',
            encoding: {
                x: 'date',
                y: 'price',
                y0: 'closePrice',
                low: 'low',
                high: 'high'
            },
            transform: {
                type: 'identity'
            }
        }]);
    let axesDomain = unit.getAxesDomain();
    axes.x.updateDomain(axesDomain['x-axis']);
    axes.y.updateDomain(axesDomain['y-axis']);
    let container = d3.select('body').append('div').attr('class', 'chart')
        .style('position', 'relative')
        .style('height', '350px')
        .style('width', '650px')
        .style('margin', '50px');
    unit.render(container.node());
}

d3.csv('../data/stocks.csv', (data) => {
    data = data.map(d => {
        d.closePrice = Number(d.price) - 20;
        d.high = Number(d.price) + 20;
        d.low = d.closePrice - 20;
        return d;
    });
    let schema = [{
            name: 'symbol',
            type: 'dimension'
        },
        {
            name: 'date',
            type: 'dimension',
            subtype: 'temporal',
            format: '%b %e %Y'
        },
        {
            name: 'price',
            type: 'measure'
        },
        {
            name: 'closePrice',
            type: 'measure'
        },
        {
            name: 'low',
            type: 'measure'
        },
        {
            name: 'high',
            type: 'measure'
        }
    ];
    let dataModel = new DataModel(data, schema);
    renderVisualUnit(dataModel);
});