/* eslint-disable */
(function () {
    let env = muze.Muze();
    let DataTable = muze.DataTable,
        share = muze.operators.share;
    let layerFactory = muze.layerFactory;

    d3.json('../../data/iris.cleared.json', (data) => {
        const jsonData = data,
            schema = [{
                name: 'organ',
                type: 'dimension'
            },
            {
                name: 'minValue',
                type: 'measure'
            },
            {
                name: 'meanValue',
                type: 'measure'
            },
            {
                name: 'maxValue',
                type: 'measure'
            },
            {
                name: 'quarter',
                type: 'measure'
            },
            {
                name: 'thirdQuarter',
                type: 'measure'
            }
            ];

        window.rootData = new DataTable(jsonData, schema);

        layerFactory.composeLayers('boxMark', [
			{
				name: 'leftTick',
				className: 'leftTick',
				mark: 'point',
				className: 'boxTicks',
				encoding: {
					y: 'boxMark.encoding.quarter',
					x: 'boxMark.encoding.x',
					y0: 'boxMark.encoding.minValue',
					shape: {
						value: 'line'
					}
				},
				interactive: false
			},
			{
				name: 'lowerBand',
				mark: 'bar',
				className: 'lowerBand',
					encoding: {
						y0: 'boxMark.encoding.meanValue',
						x: 'boxMark.encoding.x',
						y: 'boxMark.encoding.quarter',
					},
					transform: {
						type: 'identity'
					}
			},
			{
				name: 'upperBand',
				mark: 'bar',
				className: 'upperBand',
				encoding: {
					y: 'boxMark.encoding.thirdQuarter',
					x: 'boxMark.encoding.x',
					y0: 'boxMark.encoding.meanValue',
				},
				transform: {
					type: 'identity'
				}
			},
			{
				name: 'rightTick',
				mark: 'point',
				className: 'boxTicks',
				encoding: {
					y: 'boxMark.encoding.maxValue',
					x: 'boxMark.encoding.x',
					y0: 'boxMark.encoding.thirdQuarter',
					shape: {
						value: 'line'
					}
				},
				interactive: false
			},
			{
				name: 'minTick',
				mark: 'point',
				className: 'boxTicks',
				encoding: {
					y: 'boxMark.encoding.minValue',
					x: 'boxMark.encoding.x',
					shape: {
						value: 'line'
					}
				},
				interactive: false
			},
			{
				name: 'maxTick',
				mark: 'point',
				className: 'boxTicks',
				encoding: {
					y: 'boxMark.encoding.maxValue',
					x: 'boxMark.encoding.x',
					shape: {
						value: 'line'
					}
				},
				interactive: false
			},
			{
				name: 'meanTick',
				mark: 'point',
				className: 'boxTicks',
				encoding: {
					y: 'boxMark.encoding.meanValue',
					x: 'boxMark.encoding.x',
					shape: {
						value: 'line'
					}
				},
				interactive: false
			}
		]);

        env = env.width(500)
			.height(500)
			.data(rootData);

        let canvas = env.canvas();
		let mountPoint = document.getElementById('chart');
        let columns = [sharedField = share('minValue', 'meanValue', 'maxValue', 'quarter', 'thirdQuarter')],
            rows = ['organ'];

        canvas = canvas
			.rows(columns)
            .columns(rows)
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
            }
            )
			.layers({
				[sharedField]: {
					mark: 'boxMark',
					encoding: {
						minValue: 'minValue',
						meanValue: 'meanValue',
						x: 'organ',
						maxValue: 'maxValue',
						quarter: 'quarter',
						thirdQuarter: 'thirdQuarter'
					}
				}
			})
			.mount(mountPoint);
    });
}());
