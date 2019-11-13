/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars-with-null.json', (data) => {
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
    let rootData = new DataModel(jsonData, schema);
    let canvas = env.canvas();

    canvas = canvas
      .rows(['Acceleration']) // Acceleration goes in Y-Axis
      .columns(['Year']) // Horsepower goes in Y-Axis
      .data(rootData)
      .layers([{
        mark : 'area',
        interpolate: 'catmullRom' /* spline */
      }])
      .color('Origin')
      .width(850)
      .height(650)
      .title('Area')
      .mount("#chart1");
});

