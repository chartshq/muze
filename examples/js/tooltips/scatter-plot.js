/* eslint-disable */
const env2 = muze();
const DataModel2 = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData2 = data;
    const schema2 = [{
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
        type: 'dimension'
    }
    ];
    let rootData2 = new DataModel2(jsonData2, schema2);
    let canvas2 = env2.canvas();
		const makers = ['bmw', 'ford', 'toyota', 'amc'];
		rootData2 = rootData2.select(fields => makers.indexOf(fields.Maker.value) > -1);
		
    canvas2 = canvas2
        .rows(['Horsepower']) // Acceleration goes in Y-Axis
        .columns(['Year']) // Horsepower goes in Y-Axis
        .size('Acceleration') // Use maker for shape encoding
        .data(rootData2)
        .width(450)
        .height(350)
        .layers([{
            mark: 'point'
        }])
        .title('Scatter with shape and color legend')
        .mount("#chart3");
});

