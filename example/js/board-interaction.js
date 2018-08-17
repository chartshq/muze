/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataModel = muze.DataModel,
		share = muze.operators.share,
		Board = muze.Board;
		window.board = new Board();


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

		rootData = rootData.groupBy(['Cylinders', 'Year'], {
			Horsepower: 'mean',
			Acceleration: 'mean'
		});
		window.rootData = rootData;
window.env = env;
		env = env.width(2000)
			.height(400)
			.data(rootData);

			env = env.minUnitWidth(10)
            .minUnitHeight(50)
		window.canvas = env.canvas();

		let mountPoint = document.getElementById('chart');
		let canvas2 = env.canvas();
		let canvas3 = env.canvas();
		let rows = [ 'Displacement', 'Horsepower'],
			columns = ['Cylinders', 'Year'],
			color = 'Horsepower',
			size = 'Maker';

		canvas = canvas
			.rows(rows)
			.columns(columns)
			.data(rootData)
			.color('Cylinders')
			// .width(500)
			// .height(400);


		canvas2 = canvas2
			.rows([
				['Acceleration']
			])
			.columns(columns)
			.data(rootData)
			.color('Cylinders')
			.width(500)
			.height(400);
		canvas3 = canvas3
			.rows([
				['Displacement']
			])
			.columns(columns)
			.data(rootData)
			.color('Cylinders')
			.width(500)
			.height(400);

	let canvases = [canvas, canvas2];


		board
		.vStack()
		.width(2000)
        .height(600)

        .source(canvases)
        .legend({
            align: 'vertical',
            item:{
                text:{
                    position:'bottom'
                }
            },
        })
		// .title('')
		// .subTitle('')
		.config({
			distribution: [1, 1, 1],
            gutter: 0.02
		})
		.resolve({
            interaction: {
                // Case 1
                sideeffect: 'common', // By default side effect is individual
                // Case 2 When user gives a function
                // sideeffect: (canvases, board) => {
                //     board.forEachCell((el) => {
                //         let sideEffects = el.unit.firebolt.sideEffects;
                //         sideEffects.crossline.disable();
                //         sideEffects.tooltip.disable();
				//     });
				//     // enable global crossline
				//     board.firebolt.sideEffects.crossline.enable();
				//	  // Disable global selection box
                //     board.firebolt.sideEffects.selectionBox.disable();
				// },
            }
        })
        .mount(mountPoint);
	});
})()
