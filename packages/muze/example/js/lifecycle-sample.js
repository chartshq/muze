
let env = muze.Muze();
let DataModel = muze.DataModel;


d3.json('../../data/cars.json', (data) => {
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

    window.rootData = new DataModel(jsonData, schema);
    window.rootData1 = rootData.select(fields => fields.Displacement.internalValue < 300);
    window.rootData2 = rootData.select(fields => fields.Origin.value === 'USA');

    let mountPoint = document.getElementById('chart');


    window.canvas = env.canvas();


    let rows = ['Acceleration'],
        columns = ['Origin', 'Weight_in_lbs'];

    canvas.mount(mountPoint)
                    .color('Origin')
                    .width(1200)
                    .data(rootData)
                    .rows(rows)
                    .height(600)
                    .columns(columns);
});
