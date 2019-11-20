/* eslint-disable */
d3.json('../../../data/cars.json', (data) => {
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
			type: 'measure',
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
		},
	];
	let DataModel = muze.DataModel;
	let dm = new DataModel(data, schema);
	// dm = dm.select(d => d.Origin.value === 'USA');
	
    // const makers = ['bmw', 'ford', 'toyota', 'amc'];
    // rootData = rootData.select(fields => makers.indexOf(fields.Maker.value) > -1);
	
  	let env = muze();
	
	canvas = env.canvas();
    canvas
		.data(dm)
		.width(850)
		.height(650)
		.rows(["Horsepower"])
		.columns(["Year"])
		.color("Origin")
		.size("Horsepower")
		.layers([{
			mark: 'point'
		}])
		.mount(document.getElementById('chart'));
})