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
    
    let canvas1 = env.canvas();
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
	canvas1
  		.rows(['CountVehicle']) // CountVehicle goes in y axis
      	.columns(['Cylinders']) // Cylinders goes in x-axis
      	.color('Origin') // Colors encoding using the Origin field
        .data(dmWithCount)
        .config({
			legend: {
				position: 'bottom'
			}
		})
  		.layers([{mark: 'bar',encoding: { y: 'CountVehicle' },transform: { type: 'stack' }}])      	.width(600)
      	.height(400)
  		.title('Stacked bar chart', { position: 'top', align: 'right'})
  		.subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right'})
      	.mount('#chart2');
});

