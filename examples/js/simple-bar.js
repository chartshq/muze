(function () {
    const env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('../data/cars.json', (data) => {
        const schema = [{
            name: 'Acceleration',
            type: 'measure',
            defAggFn: 'avg'
        }, {
            name: 'Origin',
            type: 'dimension'
        }, {
            name: 'Year',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }];
        // {data}
        const rootData = new DataModel(data, schema);

        const canvas = env.canvas()
                          .data(rootData)
                          .rows(['Acceleration'])
                          .columns(['Origin'])
                          .color('Year')
                          .width(600)
                          .height(500)
                          .mount(document.getElementById('chart'))
                          .once('canvas.animationend').then((client) => {
                              const element = document.getElementById('chart');
                              element.classList.add('animateon');
                          });
    });
}());
