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
        name: 'simplebar',
        mark: 'bar',
        encoding: {
            x: 'labeledBar.encoding.x',
            y: 'labeledBar.encoding.y',
            color: 'labeledBar.encoding.color',
        }
    }, {
        mark: 'text',
        dataSource: 'textData',
        source: ['simplebar'],
        encoding: {
            x: 'labeledBar.encoding.x',
            y: 'labeledBar.encoding.y',
            text: {
                field: 'labeledBar.encoding.y.field',
                formatter: (value) => value.toFixed(2)
            }
        },
        transform: {
            type: 'stack',
            groupBy: 'labeledBar.encoding.color.field'
        },
        positioner: (points, store, layerInst) => {
            let padY = 3;
            let smartLabel = layerInst.dependencies().smartLabel;
            for (let i = 0; i < points.length; i++) {
                let updateAttrs = points[i].update;
                let textSize = smartLabel.getOriSize(points[i].text);
                updateAttrs.y -= padY;
                if (updateAttrs.y - textSize.height < 0) {
                    updateAttrs.y += textSize.height;
                    points[i].color = '#fff';
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
