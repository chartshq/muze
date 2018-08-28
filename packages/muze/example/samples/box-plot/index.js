(function () {
	const picassoInstance = muze.Muze();
	var DataTable = muze.DataTable,
		share = muze.operators.share;
	layerFactory = muze.layerFactory;

	d3.json('../../data/iris.cleared.json', (data) => {
		const jsonData = data,
			schema = [{
					"name": "organ",
					"type": "dimension"
				},
				{
					"name": "minValue",
					"type": "measure"
				},
				{
					"name": "meanValue",
					"type": "measure"
				},
				{
					"name": "maxValue",
					"type": "measure"
				},
				{
					"name": "quarter",
					"type": "measure"
				},
				{
					"name": "thirdQuarter",
					"type": "measure"
				}
			];


		const {
			container,
			width,
			height
		} = picassoContainer();

		window.rootData = new DataTable(jsonData, schema);

		layerFactory.composeLayers('boxMark', [{
				name: 'leftTick',
				layerType: 'point',
				definition: {
					encoding: {
						x0: 'boxMark.encoding.quarter',
						y: 'boxMark.encoding.y',
						x: 'boxMark.encoding.minValue',
						shape: {
							value: 'line'
						}
					},
					find: false
				}
			},
			{
				name: 'leftBand',
				layerType: 'bar',
				definition: {
					className: 'leftBand',
					encoding: {
						x0: 'boxMark.encoding.meanValue',
						y: 'boxMark.encoding.y',
						x: 'boxMark.encoding.quarter',
					},
					transform: {
						type: 'identity'
					},
					transition: {
						disabled: true
					}
				}
			},
			{
				name: 'rightBand',
				layerType: 'bar',
				definition: {
					className: 'rightBand',
					encoding: {
						x0: 'boxMark.encoding.thirdQuarter',
						y: 'boxMark.encoding.y',
						x: 'boxMark.encoding.meanValue',
					},
					transform: {
						type: 'identity'
					},
					transition: {
						disabled: true
					}
				}
			},
			{
				name: 'rightTick',
				layerType: 'point',
				definition: {
					encoding: {
						x0: 'boxMark.encoding.maxValue',
						y: 'boxMark.encoding.y',
						x: 'boxMark.encoding.thirdQuarter',
						shape: {
							value: 'line'
						}
					},
					find: false
				}
			}
		])

		let renderer = picassoInstance.width(width)
			.height(height)
			.data(rootData);

		let viz = renderer.instance();

		let columns = [sharedField = share('minValue', 'meanValue', 'maxValue', 'quarter', 'thirdQuarter')],
			rows = ['organ'];

		viz = viz
			.rows(rows)
			.columns(columns)
			.layers({
				[sharedField]: {
					mark: 'boxMark',
					encoding: {
						minValue: 'minValue',
						meanValue: 'meanValue',
						y: 'organ',
						maxValue: 'maxValue',
						quarter: 'quarter',
						thirdQuarter: 'thirdQuarter'
					}
				}
			})
			.mount(container.node());

	});
})()
