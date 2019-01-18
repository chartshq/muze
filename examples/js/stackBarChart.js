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
  		.rows(['Maker']) // CountVehicle goes in y axis
          .columns(['Acceleration']) // Cylinders goes in x-axis
          .color({
              field: 'Acceleration',
              stops: 20
          })
                    .data(rootData)
  		.layers({ // Draw a bar plot, by default stack transform is used
        	Acceleration: {
            	mark: 'bar'
        }
  })
                    .config({
                        item: {
                            title: {
                                text: 'gavdakbdka djahvd akj djahv dak dvak'
                            }
                        },
                        legend: {
                            position: 'right'
                        }
                    })
      	.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right' })
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right' })
      	.mount('#chart'); // Set the chart mount point
});
