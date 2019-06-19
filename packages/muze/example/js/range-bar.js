const env = window.muze();
const DataModel = window.muze.DataModel;
const share = window.muze.operators.share;
const mountPoint = document.getElementById('chart');

d3.csv('../../data/seattle-weather.csv', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'date',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y/%m/%d'
        }, {
            name: 'temp_max',
            type: 'measure'
        },
        {
            name: 'temp_min',
            type: 'measure'
        },
        {
            name: 'weather',
            type: 'dimension'
        }
    ];

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.select(fields => fields.date.internalValue <= new Date(2012, 2, 1).getTime());
    const rows = [op = share('temp_max', 'temp_min')];
    const columns = ['date'];

    let canvas = env.canvas();
    canvas = canvas
            .rows(rows)
            .columns(columns)
            .data(rootData)
            .color('weather')
            .width(1200)
            .height(600)
.layers([
    {
        mark: 'area',
        encoding: {
            x: 'date',
            y: 'temp_max',
            y0: 'temp_min'
        },
        transform: {
            type: 'group'
        }
    }
])
            .mount(mountPoint);
});
