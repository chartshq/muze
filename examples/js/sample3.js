/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    const jsonData = data;
    const schema = [{
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

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.groupBy(["Origin", "Year"], {
        Acceleration: "avg"
    })

    env.canvas()
        .data(rootData)
        .rows(['Acceleration'])
        .columns(["Year"])
        .color("Origin")
        .height(500)
        .width(600)
        .title("Year wise average car Acceleration")
        .mount('#chart');
});

