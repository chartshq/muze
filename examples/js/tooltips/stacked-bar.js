/* eslint-disable */
const env4 = muze();
const DataModel4 = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData4 = data;
    const schema4 = [{
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
    let rootData4 = new DataModel4(jsonData4, schema4);
    let canvas4 = env4.canvas();
		
    canvas4 = canvas4
      .rows(['Acceleration']) // Acceleration goes in Y-Axis
      .columns(['Year']) // Horsepower goes in Y-Axis
      .color('Origin') // Color the points from using Origin
      .data(rootData4)
      .width(450)
      .height(350)
      .title('Stacked Bar Chart')
      .mount("#chart5");
});

