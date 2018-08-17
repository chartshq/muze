/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataTable = muze.DataTable,
		share = muze.operators.share,
        html = muze.operators.html,
        layerFactory = muze.layerFactory,
		Board = muze.Board;
		window.board = new Board();

    layerFactory.composeLayers('labeledBar', [{
        name: 'positiveBar',
		mark: 'bar',
		dataSource: 'positiveValues',
		className: 'positive',
        encoding: {
            x: 'labeledBar.encoding.x',
            y: 'labeledBar.encoding.y'
        }
    }, {
		name: 'negativeBar',
        mark: 'bar',
        dataSource: 'negativeValues',
		source: ['simplebar'],
		className: 'negative',
        encoding: {
            x: 'labeledBar.encoding.x',
            y: 'labeledBar.encoding.y'
        }
    }]);

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
					type: 'dimension'
				},

			];
		let rootData = new DataTable(jsonData, schema);

		rootData = rootData.groupBy(['Year'], {
			Horsepower: 'mean',
			Acceleration: 'mean'
		});

		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		let canvas2 = env.canvas();
		let canvas3 = env.canvas();
		let rows = ['Acceleration'],
			columns = ['Year'];
		canvas = canvas
			.rows(rows)
			.columns(columns)
            .data(rootData)
            .layers({
                Acceleration: {
                    mark: 'labeledBar'
                }
            })
            .width(800)
            .height(400)
            .mount(mountPoint);
	})

})()
