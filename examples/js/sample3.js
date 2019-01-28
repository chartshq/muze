/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
        let jsonData = data;
        const schema = [
            {
                name: 'Name',
                type: 'dimension'
            },
            {
                name: 'Maker',
                type: 'dimension'
            },
            {
                name: 'Miles_per_Gallon',
                type: 'measure'
            },
            {
                name: 'Displacement',
                type: 'measure'
            },
            {
                name: 'Horsepower',
                type: 'measure'
            },
            {
                name: 'Weight_in_lbs',
                type: 'measure'
            },
            {
                name: 'Acceleration',
                type: 'measure'
            },
            {
                name: 'Origin',
                type: 'dimension'
            },
            {
                name: 'Cylinders',
                type: 'dimension'
            },
            {
                name: 'Year',
                type: 'dimension',
                subtype: 'temporal',
                format: '%Y-%m-%d'
            }
        ];

        jsonData = [
            { Origin: "Canada", Year: "2018-03-11", Acceleration: 1088 },
            { Origin: "Canada", Year: "2018-03-12", Acceleration: 1923 },
            { Origin: "India", Year: "2018-03-11", Acceleration: 1111 },
            { Origin: "India", Year: "2018-03-12", Acceleration: 2534 },
            { Origin: "Japan", Year: "2018-03-11", Acceleration: 1123 },
            { Origin: "Japan", Year: "2018-03-12", Acceleration: 3664 },
        ];
        let rootData = new DataModel(jsonData, schema);
        rootData = rootData.groupBy(["Origin", "Year"], {
            Acceleration: "avg"
        });

        env.canvas()
            .data(rootData)
            .rows(['Acceleration',])
            .columns(['Year'])
            .color('Origin')
            .data(rootData)
            .height(600)
            .width(800)
            .layers([
                {
                    mark: "bar",
                    transform: {
                        type: "group"
                    }
                }
            ])
            .mount(document.getElementById('chart'));
    });
}());

