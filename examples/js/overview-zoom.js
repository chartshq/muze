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

    const rootData = new DataModel(data, schema)
    // .select(fields=>{
    //     const date = new Date(fields.date.value);
    //     const year = date.getFullYear();
    //     const month = date.getMonth();
    //     return year === 2002 && (month === 5 || month === 6);
    //     // return fields.date.value >new Date('2002', 5, 1).getTime() && fields.date.value < new Date('2002', 6, 1).getTime()
    // });

    env = env.data(rootData);
    const chartConf = {
        axes: {
            x: {
                    nice: false,
                    name: 'Date',
                    // tickFormat: (a, val)=>{
                    //     return `${new Date(val).getFullYear()}-akdnjaskjdn`
                    // }
            },
            y: {
                    name: 'Price'
            }
        }
    };

    const detail = env.canvas()
            .rows(['price'])
            .columns(['date'])
            .width(500)
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
            .width(750)
            .height(160)
            .config(chartConf)
            .layers([{
                // mark: 'area',
                interpolate: 'catmullRom'
            }])
            .mount('#chart2');
            overview.once('canvas.animationend').then(()=>{
            // overview.firebolt().dispatchBehaviour('filter', {
            //     criteria:{
            //         date: [new Date('2002', 5, 1).getTime(),new Date('2002', 6, 1).getTime()]
            //     }
            // })
        })

    muze.ActionModel
        .for(detail, overview).enableCrossInteractivity()
        .for(overview).registerPropagationBehaviourMap({
            brush: 'filter'
        });
});
