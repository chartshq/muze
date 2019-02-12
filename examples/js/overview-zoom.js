/* eslint-disable */
let i = 0;
for (i = 0; i < 2; i++) {
    const newDomNode = document.createElement('div');
    newDomNode.id = `chart${i + 1}`;
    document.getElementById('chart').appendChild(newDomNode);
}

d3.csv('../data/sp500.csv', (data) => {
    const schema = [
        {
            name: 'date',
            type: 'dimension',
            subtype: 'temporal',
            format: '%b %e %Y'
        },
        {
            name: 'price',
            type: 'measure'
        }
    ];

    let env = window.muze();
    const DataModel = window.muze.DataModel;

    const rootData = new DataModel(data, schema);

    env = env.data(rootData);
    const chartConf = {
        axes: {
            x: {
                    nice: false,
                    name: 'Date'
            },
            y: {
                    name: 'Price'
            }
        }
    };

    const detail = env.canvas()
            .rows(['price'])
            .columns(['date'])
            .width(800)
            .height(400)
            .config(chartConf)
            .layers([{
                // mark: 'area',
                transition: {
                    duration: 0
                }
            }])
            .title('Select a range from the bottom chart to get a detailed view for that range')
            .mount('#chart1');

    const overview = env.canvas()
            .rows(['price'])
            .columns(['date'])
            .width(800)
            .height(150)
            .config(chartConf)
            .layers([{
                // mark: 'area',
                interpolate: 'catmullRom'
            }])
            .mount('#chart2');

    muze.ActionModel
        .for(detail, overview).enableCrossInteractivity()
        .for(overview).registerPropagationBehaviourMap({
            brush: 'filter'
        });
});
