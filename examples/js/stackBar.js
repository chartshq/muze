d3.json('../../data/cars.json', (data) => {
    const schema = [
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

  	// Retrieves the DataModel from muze namespace. Muze recognizes DataModel as a first class source of data.
    const DataModel = muze.DataModel;
    // Create an instance of DataModel using the data and schema.
    const rootData = new DataModel(data, schema);

    // Create a new variable which will keep count of cars per cylinder for a particular origin
  	const dmWithCount = rootData.calculateVariable(
      	{
          name: 'CountVehicle',
          type: 'measure',
          defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
          numberFormat: val => parseInt(val, 10)
      },
        ['Name', () => 1]
    );

	// Create an environment for future rendering
    const env = muze();
  	// Create an instance of canvas which houses the visualization
    const canvas = env.canvas();

    canvas
  		.rows(['CountVehicle']) // CountVehicle goes in y axis
      	.columns(['Cylinders']) // Cylinders goes in x-axis
                    .color('Origin') // Colors encoding using the Origin field
                    .config({
                        legend: {
                  position: 'bottom'
              }
                    })
                    .data(dmWithCount)
  		.layers({ // Draw a bar plot, by default stack transform is used
        	Acceleration: {
            	mark: 'bar'
        }
  })
      	.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right' })
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right' })
      	.mount('#chart-container'); // Set the chart mount point
});
