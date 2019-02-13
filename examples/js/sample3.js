/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData = data;
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
        type: 'measure',
        numberFormat: (val) => "$" + val ,
        displayName: "Acceleration2"
    },
    {
        name: 'Origin',
        type: 'dimension',
        displayName: "Origin2"
    },
    {
        name: 'Cylinders',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d',
        displayName: "Year2"
    }
    ];

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.groupBy(["Origin", "Year"], {
        Acceleration: "avg"
    });

    const canvas = env.canvas()
        .data(rootData)
        .rows(['Acceleration'])
        .columns(["Origin", "Year"])
        // .color("Year")
        .height(600)
        .width(700)
        .title("Year wise average car Acceleration")
        .config({
            axes: {
                y: {
                    // name: "asssss"
                }
            }
        })
        .layers([
            {
                mark: "bar"
            }
        ])
        .mount('#chart');
});

