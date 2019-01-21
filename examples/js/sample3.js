/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
        let jsonData = data;
        const schema = [
            {
                name: 'Acceleration',
                type: 'measure',
                defAggFn: "avg"
            },
            {
                name: 'Origin',
                type: 'dimension'
            },
            {
                name: 'Year',
                type: 'dimension',
                subtype: 'temporal',
                format: '%Y-%m-%d'
            }
        ];

        let rootData = new DataModel(jsonData, schema);
        rootData = rootData.groupBy(['Origin', 'Year'], {
            Acceleration: 'max'
        });

        const mountPoint = document.getElementById('chart');
        const canvas = env.canvas()
            .data(rootData)
            .rows(['Acceleration'])
            .columns(['Year'])
            .color("Origin")
            .layers([
                {
                    mark: 'bar',
                    // transform: {
                    //     type: "stack"
                    // }
                }
            ])
            .config({
                autoGroupBy: {
                    disabled: true,
                    measures: {
                         Acceleration: 'sum'
                    }
                }
            })
            .height(500)
            .width(600)
            .mount(mountPoint);
    });
}());

