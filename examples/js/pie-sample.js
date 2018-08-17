/* eslint-disable */

(function () {
	let env = window.muze();
	let DataModel = window.muze.DataModel;

	d3.json('../../data/cars.json', (data) => {
		const jsonData = data,
			schema = [{
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
				// subtype: 'temporal',
				// format: '%Y-%m-%d'
			},

			];
		let rootData = new DataModel(jsonData, schema);

		rootData = rootData.groupBy(['Year','Origin'], {
			Horsepower: 'mean',
			Acceleration: 'mean'
		});

		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementsByClassName('chart')[0];
		window.canvas = env.canvas();
		let rows = ['Acceleration'],
			columns = [];
		canvas = canvas
			.rows(columns)
			.columns(rows)
			.layers([{
				mark: 'arc',
			}])
			.data(rootData)
			.color({
				field : 'Origin'
			})
			.width(600)
			.height(500)
			//{legend}
			.mount(mountPoint);
	})

  })()