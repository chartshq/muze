/* eslint-disable*/
let env = muze();
const DataModel = muze.DataModel;

d3.json('/data/cars.json', (data) => {
    const schema = [{
        name: 'Name',
        type: 'dimension'
    }, {
        name: 'Maker',
        type: 'dimension'
    }, {
        name: 'Miles_per_Gallon',
        type: 'measure'
    }, {
        name: 'Displacement',
        type: 'measure'
    }, {
        name: 'Horsepower',
        type: 'measure'
    }, {
        name: 'Weight_in_lbs',
        type: 'measure'
    }, {
        name: 'Acceleration',
        type: 'measure'
    }, {
        name: 'Origin',
        type: 'dimension'
    }, {
        name: 'Cylinders',
        type: 'dimension'
    }, {
        name: 'Year',
        type: 'dimension',
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }];
    // Create an instance of DataModel using the data and schema.
    let rootData = new DataModel(data, schema);

	env.canvas()
  		.rows(['Horsepower']) // CountVehicle goes in y axis
      	.columns(['Acceleration']) // Cylinders goes in x-axis
      	.color('Origin') // Colors encoding using the Origin field
        .data([])
        .config({
            legend: {
                color: {
                    item: {
                        text: { orientation: 'bottom' }
                    }
                },
                position: 'right'
            }
        })
  		.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right'})
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right'})
        .mount('#chart2');
    
    env.canvas()
  		.rows(['Horsepower']) // CountVehicle goes in y axis
      	.columns(['Origin']) // Cylinders goes in x-axis
      	.size('Acceleration') // Colors encoding using the Origin field
        .data(rootData)
        .config({
            legend: {
                size: {
                    item: {
                        text: { orientation: 'right' }
                    }
                },
                position: 'right'
            }
        })
  		.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right'})
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right'})
          .mount('#chart3');
          
        env.canvas()
  		.rows(['Horsepower']) // CountVehicle goes in y axis
      	.columns(['Origin']) // Cylinders goes in x-axis
      	.size('Acceleration') // Colors encoding using the Origin field
        .data(rootData)
        .config({
            legend: {
                // size: {
                //     item: {
                //         text: { orientation: 'bottom' }
                //     }
                // }
                position: 'right'
            }
        })
  		.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right'})
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right'})
          .mount('#chart4');
          
          env.canvas()
  		.rows(['Horsepower']) // CountVehicle goes in y axis
      	.columns(['Origin']) // Cylinders goes in x-axis
      	.color('Acceleration') // Colors encoding using the Origin field
        .data(rootData)
        .config({
            legend: {
                // size: {
                //     item: {
                //         text: { orientation: 'bottom' }
                //     }
                // }
                position: 'left'
            }
        })
  		.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right'})
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right'})
      	.mount('#chart5');
});

