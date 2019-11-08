/* eslint-disable*/
/* eslint-disable*/
d3.csv('/data/areaData.csv', (data) => {
    const schema = [{
        name: 'Profit',
        type: 'measure'
    }, {
        name: 'Type',
        type: 'dimension'
    }, {
        name: 'Year',
        type: 'dimension'
    }];;
    // Create an instance of DataModel using the data and schema.
    let dm = new DataModel(data, schema);    
    
    // Get a canvas instance from Muze where the chart will be rendered.
    let canvas = env.canvas();
    const chartConf = {
        axes: {
            x: {
                nice: false,
                name: 'Date'
            }
        }
    };

canvas.rows(['Profit'])
        .columns(['Year'])
        .width(800)
        .height(600)
        .data(dm)
        .color('Type')
        .layers([{
            mark: 'area'
        }])
        .config(chartConf)
        .mount('#chart3');
});

