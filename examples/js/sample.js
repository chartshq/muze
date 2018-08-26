/* eslint-disable */

(function () {
    let env = muze();
    let DataModel = muze.DataModel,
        share = muze.operators.share,
        html = muze.operators.html,
        actionModel = muze.ActionModel;
    const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;
    console.log(muze.SideEffects, muze.Behaviours);


    d3.json('../data/cars.json', (data) => {
        const jsonData = data,
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
                type: 'measure'
            },
            {
                name: 'Weight_in_lbs',
                type: 'measure',
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
                // subtype: 'temporal',
                // format: '%Y-%m-%d'
            },

            ];
        let rootData = new DataModel(jsonData, schema);

        // rootData = rootData.groupBy(['Year'], {
        //     Horsepower: 'mean',
        //     Acceleration: 'mean'
        // });

        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        let mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        let rows = ['Acceleration', 'Horsepower', 'Miles_per_Gallon'],
            columns = ['Miles_per_Gallon', 'Horsepower', 'Acceleration']
        canvas = canvas
            .rows(rows)
            .columns(columns)
            .data(rootData)
            .detail(['Maker'])
            .width(1200)
            .height(800)
            .config({
                border: {
                    width: 2,
                },
                axes: {
                    x: {
                        showAxisName: true,
                        axisNamePadding: 20,
                    }, y: {
                        showAxisName: true,
                        axisNamePadding: 20,
                    }
                }
            })
            .title('The Muze Project', { position: "top", align: "left", })
            .subtitle('Composable visualisations with a data first approach', { position: "top", align: "left" })
            .mount(document.getElementsByTagName('body')[0]);
    })

})()
