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
			type: 'measure',
			// defAggFn: 'min'
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
	// dm = dm.select(d => d.Year.internalValue === -19800000 || d.Year.internalValue === 31516200000);
	// dm = dm.select(d => d.Origin.value !== 'European Union');
    // const makers = ['bmw', 'ford', 'toyota', 'amc'];
    // rootData = rootData.select(fields => makers.indexOf(fields.Maker.value) > -1);
	
	let env = muze();
	
	canvas = env.canvas();
    canvas
		.data(dm)
		.width(850)
		.height(650)
		.rows(["Acceleration"])
		.columns(["Year"])
		.color("Maker")
		// .size('Horsepower')
		.layers([{
			mark: 'bar',
		}])
		.mount(document.getElementById('chart'));
})