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

        const rootData = new DataModel(jsonData, schema);
        const dm2 = rootData.groupBy(['Origin', 'Year'], {
            Acceleration: 'sum'
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
                    //     type: "group"
                    // }
                }
            ])
            .config({
                autoGroupBy: {
                    disabled: true,
                    measures: {
                        // Acceleration: 'avg'
                    }
                }
            })
            .height(500)
            .width(600)
            .mount(mountPoint);
    });
}());

