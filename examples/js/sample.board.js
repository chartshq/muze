/* eslint-disable */
let env = muze.Muze();
const DataModel = muze.DataModel;
const Board = muze.Board;
var canvas1, canvas2, canvas3;

function createCanvases() {

	let schema = [{
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

		}
	];

	return new Promise((resolve) => {
		d3.json('../../data/cars.json', (data) => {

			let rootData = new DataModel(data, schema);

			env = env.data(rootData);

			canvas1 = env.canvas();
			canvas2 = env.canvas();
			canvas3 = env.canvas();

			let rows1 = ['Acceleration'],
				rows2 = ['Horsepower'],
				rows3 = ['Weight_in_lbs'],
				columns = ['Miles_per_Gallon'];

			canvas1 = canvas1
				.rows(rows1)
				.columns(columns)
				.done();

			canvas2 = canvas2
				.rows(rows2)
				.columns(columns)
				.done();

			canvas3 = canvas3
				.rows(rows3)
				.columns(columns)
				.done();

			resolve([canvas1, canvas2, canvas3]);
		});
	});
}

(async () => {
	// get all the immidiate renderable canveses
	let canvases = await createCanvases();
	let boardMount = document.getElementById('board');

	setTimeout(function () {
		// create vertical stack layout
		window.vStack = Board.Layout.vStack()
			.source(canvases)
			.resolve({
				xAxis: (layoutMatrix) => {
					return layoutMatrix.map((e, i) => {
						if (i === layoutMatrix.length - 1) {
							return {
								show: true
							};
						}
						return {
							show: false
						};
					})
				}
			})
			.config({
				dist: [1, 2, 1],
				gutter: 0.01
			})
			.width(600)
			.height(500)
			.mount(boardMount);
	}, 10);

})
