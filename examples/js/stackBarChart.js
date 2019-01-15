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

  	const dmWithCount = rootData.calculateVariable(
      	{
          name: 'CountVehicle',
          type: 'measure',
          defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
          numberFormat: val => parseInt(val, 10)
      },
        ['Name', () => 1]
    );

    const env = muze();
    const canvas = env.canvas();

    canvas
  		.rows(['CountVehicle']) // CountVehicle goes in y axis
      	.columns(['Cylinders']) // Cylinders goes in x-axis
      	.color('Name') // Colors encoding using the Origin field
                    .data(dmWithCount)
  		.layers({ // Draw a bar plot, by default stack transform is used
        	Acceleration: {
            	mark: 'bar'
        }
  })
                    .config({
                        legend: {
                            color: {
                                title: {
                                    text: 'nadandandondlandlasndasndasndaosdaojnsodapdian'
                                }
                            },
                            position: 'right'
                        }
                    })
      	.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right' })
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right' })
      	.mount('#chart'); // Set the chart mount point
});
