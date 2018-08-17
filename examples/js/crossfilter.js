/* eslint disable */
let env = muze();
const DataModel = muze.DataModel;
const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;
d3.json('../../data/cars-2.json', (data) => {
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

    const rootData = new DataModel(jsonData, schema);
    window.rootData = rootData;
    env = env.data(rootData).minUnitHeight(100).minUnitWidth(20);
    const mountPoint = document.getElementsByClassName('chart')[0];
    let canvas = env.canvas();
    window.canvas = canvas;
    let canvas2 = env.canvas();
    const canvas3 = env.canvas();
    let rows = ['Displacement'],
        columns = ['Year'];
    canvas = canvas
			.rows(rows)
			.columns(columns)
			.width(400)
			.height(600)
			.data(rootData.groupBy(['Year', 'Origin']))
			.config({
    axes: {
        x: {

            showAxisName: true
        },
        y: {

            showAxisName: true
        }
    }
})
			.layers([{
    mark: 'bar'
}])
				.color('Origin')

	.mount(document.getElementById('chart'));

    rows = ['Horsepower'],
        columns = ['Cylinders'];
    canvas2 = canvas2
		.rows(rows)
		.columns(columns)
		.width(600)
		.height(600)
		.data(rootData.groupBy(['Cylinders', 'Origin']))
		.layers([{
    mark: 'bar'
}])
.color('Origin')

.mount(document.getElementById('chart2'));

    muze.ActionModel.for(canvas, canvas2).mapSideEffects({
        select: [{
            name: 'layer',
            applyOnSource: false
        }]
    }).target('visual-unit').registerSideEffects(
		class LayerEffect extends SpawnableSideEffect {
    static formalName () {
        return 'layer';
    }

    apply (selectionSet, payload) {
        const context = this.firebolt.context;
        const entrySet = selectionSet.mergedEnter.model;
        const layer = context.getLayerByName('lineMark');
        const xField = `${context.fields().x[0]}`;
        const yField = `${context.fields().y[0]}`;
        if (!layer) {
            context.addLayer({
                name: 'lineMark',
                mark: 'bar',
                encoding: {
                    x: xField,
                    y: yField,
                    size: {
                        value: 0.5
                    },
                    color: () => '#fff'
                }
            });
        }
        const textLayer = context.getLayerByName('textMark');
        if (!textLayer) {
            context.addLayer({
                name: 'textMark',
                mark: 'text',
                encoding: {
                    x: xField,
                    y: yField,
                    text: {
                        field: yField,
                        formatter: value => value.toFixed(2)
                    },
                    color: {
                        value: () => '#fff'
                    }
                }
            });
        }
        context.getLayerByName('lineMark').data(entrySet);
        context.getLayerByName('textMark').data(entrySet);
    }
		}
	);
});
