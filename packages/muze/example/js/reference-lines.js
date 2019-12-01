/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataTable = muze.DataTable,
		share = muze.operators.share,
        html = muze.operators.html,
        layerFactory = muze.layerFactory,
		Board = muze.Board;
		window.board = new Board();

    layerFactory.composeLayers('compositeBar', [
        {
            name: 'simplebar',
            mark: 'bar',
            encoding: {
                x: 'compositeBar.encoding.x',
                y: 'compositeBar.encoding.y',
                color: 'compositeBar.encoding.color',
            },
        },
        {
            name: 'averageLine',
            mark: 'point',
            dataSource: 'averageLine',
            encoding: {
                shape: {
                    value: 'line'
                },
                y: 'compositeBar.encoding.y'
			},
			interactive: false,
        },
        {
            name: 'averageText',
            mark: 'text',
            dataSource: 'averageLine',
            encoding: {
                y: 'compositeBar.encoding.y',
                text: {
                    field: 'compositeBar.encoding.y.field',
                    formatter: (value) => {
                        return `Average Horsepower: ${Math.round(value)}`;
                    }
                },
                background: {
                    enabled: true
                }
			},
			interactive: false,
            positioner: (points, store, layerInst) => {
                let width = store.visualunit.width();
                let smartLabel = layerInst.dependencies().smartLabel;
                for (let i = 0; i < points.length; i++) {
                    let size = smartLabel.getOriSize(points[i].text);
                    points[i].update.x = width;
                    points[i].textanchor = 'end';
                    points[i].update.y -= size.height / 2;
                }
                return points;
            }
        }
    ]);
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
			Horsepower: 'avg',
			Acceleration: 'avg'
		});

		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		let canvas2 = env.canvas();
		let canvas3 = env.canvas();
		let rows = ['Horsepower'],
			columns = ['Year'];
		canvas = canvas
			.rows(rows)
			.columns(columns)
			.data(rootData)
            // .color('Displacement')
            .transform([
                ['averageLine', [(dt) => dt.groupBy([''], { Horsepower: 'avg'})]]
            ])
            .layers({
                Horsepower: {
                    mark: 'compositeBar',
                }
            })
            .width(800)
            .height(400)
            .mount(mountPoint);
	})

})()
