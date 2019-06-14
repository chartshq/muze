/* eslint-disable */
const env1 = muze();
const DataModel1 = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData1 = data;
    const schema1 = [{
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
    let rootData1 = new DataModel1(jsonData1, schema1);
    let canvas1 = env1.canvas();

    canvas1 = canvas1
      .rows(['Acceleration']) // Acceleration goes in Y-Axis
      .columns(['Year']) // Horsepower goes in Y-Axis
      .data(rootData1)
      .width(650)
      .height(550)
      .layers([{
        mark: 'line',
        encoding: {
            x: 'Year',
            y: 'Acceleration'
        }
      }])
      .title('Line')
      .mount("#chart2");
});

