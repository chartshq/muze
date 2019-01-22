/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
        let jsonData = data;
        const schema = [
            {
                name: 'Acceleration',
                type: 'measure'
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
        // rootData = rootData.groupBy(['Origin', 'Year'], {
        //     Acceleration: 'svg'
        // });
        // rootData = rootData.select(() => true);

        const ops = DataModel.Operators;
        rootData = ops.compose(
            ops.groupBy(['Origin', 'Year'], { Acceleration: 'avg' }),
            ops.select(() => true)
        )(rootData);

        const mountPoint = document.getElementById('chart');
        const canvas = env.canvas()
            .data(rootData)
            .rows(['Acceleration'])
            .columns(['Year'])
            .color("Origin")
            .layers([
                {
                    mark: 'line',
                    transform: {
                        type: "stack"
                    }
                }
            ])
            .config({
                autoGroupBy: {
                    disabled: false,
                    measures: {
                        Acceleration: 'avg'
                    }
                }
            })
            .height(500)
            .width(600)
            .mount(mountPoint);
    });
}());

