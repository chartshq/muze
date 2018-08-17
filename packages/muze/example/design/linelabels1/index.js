/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataTable = muze.DataTable,
		share = muze.operators.share,
        html = muze.operators.html,
        layerFactory = muze.layerFactory,
		Board = muze.Board;
		window.board = new Board();

    layerFactory.composeLayers('lineWithLabels', [{
        name: 'simpleline',
        mark: 'line',
        encoding: {
            x: 'lineWithLabels.encoding.x',
            y: 'lineWithLabels.encoding.y',
            color: 'lineWithLabels.encoding.color',
        }
    }, {
        mark: 'text',
        dataSource: 'textData',
        source: ['simpleline'],
        encoding: {
            x: 'lineWithLabels.encoding.x',
            y: 'lineWithLabels.encoding.y',
            text: 'lineWithLabels.encoding.color'
        },
        positioner: (points, store, layerInst) => {
            let dataTable = layerInst.dataTable();
            let smartLabel = layerInst._dependencies.smartLabel;
            let schema = dataTable.getData().schema;
            let unitWidth = store.visualunit.width();
            let unitHeight = store.visualunit.height();
            let colorField = store.layers.simpleline.config().encoding.color.field;
            let colorFieldIndex = schema.findIndex(d => d.name === colorField);
            for (let i = 0; i < points.length; i++) {
                let data = points[i]._data;
                colorValue = data.filter((d, i) => i === colorFieldIndex);
                let text = points[i].text;
                let size = smartLabel.getOriSize(text);
                let textHeight = size.height;
                let textWidth = size.width;
                let linePoints = store.layers.simpleline.getPointsFromIdentifiers([[colorField], colorValue]);
                if (linePoints) {
                    let len = linePoints.length - 1;
					let prevPoint = linePoints[len - 1];
					let update = points[i].update;
                    let currentPoint = linePoints[len];
                    if (prevPoint.y < currentPoint.y) {
                        update.y = update.y + textHeight;
					}
					else if (update.y + textHeight > currentPoint.y) {
						update.y = currentPoint.y - textHeight / 2;
					}
                    if (update.x + textWidth > unitWidth) {
                        update.x -= ((update.x + textWidth) - unitWidth) / 2;
                    }
                }
            }
            return points;
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
					type: 'dimension',
					subtype: 'temporal',
					format: '%Y-%m-%d'
				},

			];
		let rootData = new DataTable(jsonData, schema);

		rootData = rootData.groupBy(['Origin', 'Year'], {
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
            // .color('Displacement')
            .transform([
                ['textData', [(dt) => dt.select((fields) => new Date(fields.Year.value).getFullYear() === 1982)]]
            ])
            .layers({
                Acceleration: {
                    mark: 'lineWithLabels',
                }
            })
            .color('Origin')
            .width(800)
            .height(400)
            .mount(mountPoint);
	})

})()
