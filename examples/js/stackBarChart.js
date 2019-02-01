d3.json('../data/cars.json', (data) => {
    schema = [
        {
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

    const DataModel = muze.DataModel;
    const rootData = new DataModel(data, schema);

    const env = muze();
    const canvas = env.canvas();

    canvas
  		.rows(['Acceleration']) // CountVehicle goes in y axis
          .columns(['Maker']) // Cylinders goes in x-axis
          .color({
              field: 'Acceleration',
              step: true
          })
          .shape('Name')
          .size('Name')

        .data(rootData)
  		.layers({ // Draw a bar plot, by default stack transform is used
        	Acceleration: {
            	mark: 'bar'
        }
  })
                    .config({
                        legend: {
                            position: 'bottom'
                        }
                    })
      	.width(1000)
      	.height(500)
  		.title('Stacked bar chart', { position: 'top', align: 'right' })
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right' })
      	.mount('#chart'); // Set the chart mount point
});
