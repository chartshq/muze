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
        const rows = ['Displacement'];
        const columns = ['Acceleration'];
        window.canvas = canvas;
        canvas = canvas
        .rows(['Acceleration']) // Acceleration goes in X axis
        .columns(['Displacement']) // Displacement goes in Y axis
        .detail(['Maker'])
        // .size({
        //     field: 'Cylinders', // Size retinal encoding with Cylinders
        //     range: [50, 360]
        // })
        // .color('Cylinders') // Color retinal encoding with Cylinders
        .data(rootData)
        // .layers([{
        //     mark: 'point'
        // }, {
        //     mark: 'line',
        //     source: (dt) => { // gets the lowest number from each category
        //         const cylinderValues = dt.getFieldspace().fieldsObj().Cylinders.domain();
        //         const maxs = [];
        //         cylinderValues.forEach((val) => {
        //             const dm = dt.select(fields => fields.Cylinders.value === val, { saveChild: false });
        //             const domain = dm.getFieldspace().fieldsObj().Displacement.domain();
        //             maxs.push(domain[0]);
        //         });
        //         return dt.select(fields => maxs.indexOf(fields.Displacement.value) !== -1);
        //     },
        //     transform: {
        //         type: 'identity'
        //     },
        //     encoding: { color: { value: () => '#607d8b' } },
        //     interpolate: 'catmullRom'
        // }])
        // .width(500)
        // .height(500)
        .title('Scatter plot with retinal encodings', { position: 'top', align: 'left' })
        .subtitle('Acceleration vs Displacement with color and shape axis', { position: 'top', align: 'left' })
        .mount('#chart');
    });
}());
