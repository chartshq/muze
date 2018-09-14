/* eslint-disable */

(function () {
	let env = muze();
	let DataModel = muze.DataModel;
	let html = muze.Operators.html;
	const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;


	d3.json('../data/cars.json', (data) => {
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


		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		let rows = [['Acceleration']],
			columns = ['Year'];
		canvas.data(rootData)
			.width(600)
			.height(400)
			.columns(['Cylinders'])
			.size('Weight_in_lbs')
			.color('Weight_in_lbs')
			.rows(['Horsepower'])
			.detail(['Maker'])
			.config({
				interaction: {
					tooltip: {
						formatter: (dataModel) => {
							const tooltipData = dataModel.getData().data;
							const fieldConfig = dataModel.getFieldsConfig();
							let tooltipContent = '<table>'
							tooltipContent += '<thead>';
							tooltipContent += '<tr>'
							tooltipContent += '<th>Cylinders</th>'
							tooltipContent += '<th>Maker</th>'
							tooltipContent += '<th>Horsepower</th>';
							tooltipContent += '<th>Weight(in lbs)</th>';
							tooltipContent += '</tr></thead><tbody>';
							tooltipData.forEach((dataArray) => {
								const makerVal = dataArray[fieldConfig.Maker.index];
								const hpVal = dataArray[fieldConfig.Horsepower.index];
								const cylVal = dataArray[fieldConfig.Cylinders.index];
								const weightVal = dataArray[fieldConfig.Weight_in_lbs.index];

								tooltipContent += '<tr>'
								tooltipContent += `<td>${cylVal}</td>`;
								tooltipContent += `<td>${makerVal}</td>`;
								tooltipContent += `<td>${hpVal}</td>`;
								tooltipContent += `<td>${weightVal}</td>`;
							})
							tooltipContent += `</tr></tbody></table>`;
	
							return html`${tooltipContent}`
						}
					}
				}
			})
			.layers([{ mark: 'point' }])
			.mount('#chart');


		// .title('The Muze Project', { position: "top", align: "left",  })
		// .subtitle('Composable visualisations with a data first approach', { position: "top", align: "left" })
		// .mount(document.getElementsByTagName('body')[0]);
	})

})()
