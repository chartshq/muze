/* eslint-disable */
const env3 = muze();
const DataModel3= muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData3 = data;
    const schema3 = [{
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
    let rootData3 = new DataModel3(jsonData3, schema3);
    let canvas3 = env3.canvas();
		
    canvas3 = canvas3
      .rows(['Acceleration']) // Acceleration goes in Y-Axis
      .columns(['Year']) // Horsepower goes in Y-Axis
      .data(rootData3)
      .width(450)
      .height(250)
      .title('Simple BAr Chart')
      .mount("#chart4");
});

