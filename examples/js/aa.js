/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.csv('/data/weather.csv', (data) => {
        const share = muze.Operators.share;
        const schema = [{
        name: 'maxDays',
        type: 'measure'
    }, {
        name: 'minDays',
        type: 'measure'
    }, {
        name: 'time',
        type: 'dimension',
    }];

    let rootData = new DataModel(data, schema)

    // rootData.sort([
    //     ['Cylinders', 'asc'],
    //     ['Maker', 'desc'],
    // ])

    const canvas = env.canvas();
    
    canvas
        .data(rootData)
        // .rows(['maxDays'])
        .rows([share('maxDays', 'minDays')])
        .columns(['time'])
        .layers([{ mark: 'tick', encoding: { y: 'maxDays', y0: 'minDays' } } ])
        // .layers([{
        //     mark: 'area'
        // }])
        // .detail(['Name'])
        .mount('#chart')
        .height(500)
        .width(900)
        .title('Charts');
    })
})();