/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataTable = muze.DataTable,
		share = muze.operators.share,
		html = muze.operators.html,
		Board = muze.Board;
		window.board = new Board();


	d3.json('../../../data/cars.json', (data) => {
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
		let columns = [[ 'Acceleration']],
			rows = [['Year']];
		canvas = canvas
			.rows(rows)
			.columns(columns)
            .data(rootData)
			.width(900)
            .height(600)
            .config({
                border:{
                    width: 2,
                    showRowBorders: false,
                    showColBorders:false,
                    showValueBorders: {
                        top: false,
                        bottom: true,
                        left: true,
                        right: false
                    }
                },
                axes:{
                        x:{
                            showAxisName: true,


                    }, y:{
                        showAxisName: true,
                        // name: 'Acceleration per year',
                        axisNamePadding: 12
                    }
                }
            })

        canvas.legend({
            align:'horizontal',
            title: [''],
            item:{
                text:{
                    position:'right'
                }
            },
            steps: 6
        })

        .title('The Muze Project', { position: "top", align: "left",  })
		.subtitle('Composable visualisations with a data first approach', { position: "top", align: "left" })
		.mount(document.getElementsByTagName('body')[0]);
	})

})()
