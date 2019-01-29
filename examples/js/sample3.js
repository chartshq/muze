/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
         data = [
            ["Horsepower", "Acceleration", "Origin", "Year", "Name"],
            [null, 22.4, "USA", "2001-01", "ford"],
            [115, 17.5, "Europe", "2002-01", "mazda"],
            [95, null, "Japan", null, "audi"],
            [120, 13.9, "India", "2004-01", null],
            [102, 15.7, "China", "2005-01", "chevroleet"]
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

