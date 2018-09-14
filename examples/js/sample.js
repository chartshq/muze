(function () {
    let env = muze();
    const DataModel = muze.DataModel;
    const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;

    d3.json('./data/cars.json', (data) => {
        let jsonData = data,
            schema = [{
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
                type: 'dimension'
            // subtype: 'temporal',
            // format: '%Y-%m-%d'
            }

            ];
        const rootData = new DataModel(jsonData, schema);

    // rootData = rootData.groupBy(['Year'], {
    //     Horsepower: 'mean',
    //     Acceleration: 'mean'
    // });

        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        let canvas = env.canvas();
        const rows = ['Horsepower'];
        const columns = ['Year'];
        canvas = canvas
            .rows(rows)
            .columns(columns)
            .data(rootData)
            .width(600)

            .height(300)
            .title('The Muze Project', { position: 'top', align: 'left' })
            .subtitle('Composable visualisations with a data first approach', { position: 'top', align: 'left' })
            .mount(document.getElementById('chart'));
    });
}());
