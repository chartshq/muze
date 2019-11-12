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

    rootData = rootData.calculateVariable({
        name: "date",
        type: "dimension",
        subtype: "temporal",
        format: "%Y-%m-%d"
    }, ["Year", function (d) {
        return d;
    }]);

    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    var rows = ['Cylinders', 'Horsepower'],
        columns = ['Origin', 'Year'];
    canvas = canvas.rows(rows).columns(columns).height(800).color('Origin')
    //{initProps}
    .mount(mountPoint);

    setTimeout(() => {
        canvas.rows(['Horsepower', 'Acceleration']).columns(['Acceleration', 'Horsepower']).color('Horsepower').size('Cylinders').detail(['Maker']).width(300).height(300);
        canvas.once('canvas.animationend').then(function (client) {
            var element = document.getElementById('chart');
            element.classList.add('animateon');
        });
    }, 3000);

    // const canvas = env.canvas();
    
    // canvas
    //     .data(rootData)
    //     // .rows(['maxDays'])
    //     .rows([share('maxDays', 'minDays')])
    //     .columns(['time'])
    //     .layers([{ mark: 'tick', encoding: { y: 'maxDays', y0: 'minDays' } } ])
    //     // .layers([{
    //     //     mark: 'area'
    //     // }])
    //     // .detail(['Name'])
    //     .mount('#chart')
    //     .height(500)
    //     .width(900)
    //     .title('Charts');
    })
})();