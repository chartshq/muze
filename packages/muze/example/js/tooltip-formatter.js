/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataModel = muze.DataModel,
		share = muze.operators.share,
		Board = muze.Board,
		html = muze.operators.html;
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
					type: 'dimension'
				},

			];
		let rootData = new DataModel(jsonData, schema);

		rootData = rootData.groupBy(['Origin', 'Year'], {
			Horsepower: 'mean',
			Acceleration: 'mean'
		});

		env = env.width(2000)
			.height(400)
			.data(rootData);

			env = env.minUnitWidth(0)
            .minUnitHeight(50)
		window.canvas = env.canvas();

		let mountPoint = document.getElementById('chart');
		let canvas2 = env.canvas();
		// let canvas3 = env.canvas();
		let rows = [ 'Displacement'],
			columns = ['Year'],
			color = 'Horsepower',
			size = 'Maker';


		canvas = canvas
			.rows(rows)
			.columns(columns)
			.data(rootData.groupBy(['Origin', 'Year'], {
				Horsepower: 'mean',
				Acceleration: 'mean'
            }))
			.color('Origin')
			.width(500)
			.height(400);


		canvas2 = canvas2
			.rows([
				['Horsepower']
			])
			.columns(columns)
			.data(rootData.groupBy(['Origin', 'Year'], {
				Horsepower: 'mean',
				Acceleration: 'mean'
			}))
			.color('Origin')
			.width(500)
			.height(400)

	let canvases = [canvas, canvas2];


		board
		.vStack()
		.width(1000)
		.height(500)
        .source(canvases)
        .title('ads')
        .subTitle('adsasdas')
		.config({
			distribution: [1, 2, 1],
            gutter: 0.02
		})
		.resolve({
            interaction: {
                // tooltip: 'consolidated',
                // Case 2
                // tooltip: 'fragmented',
                // Case 3
                tooltip: (canvases, board) => {
                    board.firebolt.sideEffects.tooltip.enable();
                    board.firebolt.sideEffects.tooltip.config({
                        formatter: (dataModel, context) => {
                            let dataObj = dataModel.getData(),
								schema = dataObj.schema,
								data = dataObj.data,
                                origin = schema.findIndex(d => d.name === 'Origin');

                            return [
                                ['Origin', data[0][origin]]
							];
							// return html`<p>Origin</p><span>${data[0][origin]}</span>`;
                        }
                    });
                    board.forEachCell((el) => {
                        el.unit.firebolt.sideEffects.tooltip.disable();
                    });
                }
            }
        })
        .mount(mountPoint);
	});
})()
