(function () {
    let env = muze();
    const DataModel = muze.DataModel;

    d3.json('../data/cars.json', (data) => {
        const jsonData = data,
            schema = [
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
                    type: 'measure',
                    defAggFn: 'avg'
                },
                {
                    name: 'Weight_in_lbs',
                    type: 'measure'
                },
                {
                    name: 'Acceleration',
                    type: 'measure',
                    defAggFn: 'sum'
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
        let rootData = new DataModel(jsonData, schema);

        // Create a new variable which will keep count of cars per cylinder for a particular origin
        rootData = rootData.calculateVariable(
            {
                name: 'CountVehicle',
                type: 'measure',
                defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
                numberFormat: val => parseInt(val, 10)
            },
            ['Name', () => 1]
        );
        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        let canvas = env.canvas();

        let rows = ['CountVehicle'],
            columns = ['Year'];
        canvas = canvas
            .rows(rows)
            .columns(columns)
            .data(rootData)
            .width(400)
            .height(300)
            .color({
                field: 'Horsepower'
            })
            .layers([{
                mark: 'bar'
            }])
            .mount('#chart');

        let canvas2 = env.canvas();
        canvas2 = canvas2
            .rows([])
            .columns([])
            .data(rootData)
            .width(400)
            .height(400)
            // .detail(['Maker'])
            .color('Cylinders')
            .layers([{
                mark: 'arc',
                encoding: {
                    angle: 'Maker'
                }
            }])
            .mount('#chart2');

        let canvas3 = env.canvas();
        canvas3 = canvas3
            .rows([])
            .columns([])
            .data(rootData)
            .layers([{
                // Map the Maker to angle encoding, each maker will get equal angle since Maker is dimension
                // Map the CountVehicle to raidus encoding, the greater the number of vehicle a maker has radius for that slice will be larger
                mark: 'arc',
                encoding: {
                    radius: 'CountVehicle',
                    angle: 'Maker'
                },
                innerRadius: 50
            }])
            .width(400)
            .height(400)
            .color('Cylinders')
            .mount('#chart3');

        // muze.ActionModel.for(canvas, canvas2, canvas3).enableCrossInteractivity();
    });
}());
