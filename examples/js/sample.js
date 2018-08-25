/* eslint-disable */

(function () {
    let env = muze();
    let DataModel = muze.DataModel,
        share = muze.operators.share,
        html = muze.operators.html,
        actionModel = muze.ActionModel;

        let layerFactory = muze.layerFactory;
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
            
            layerFactory.composeLayers('heatMapText', [
                {
                    name: 'bar',
                    mark: 'bar',
                    encoding: {
                        y: 'heatMapText.encoding.y',
                        x: 'heatMapText.encoding.x',
                        color: 'heatMapText.encoding.color'
                    },
                },
                {
                    name: 'text',
                    mark: 'text',
                    source: ['bar'],
                        encoding: {
                            x: 'heatMapText.encoding.x',
                            y: 'heatMapText.encoding.y',
                            text: 'heatMapText.encoding.text',
                            color: {
                                value : ()=>'black'
                            }
                        },
                        positioner: (points, store, dependencies) => {
                          store.layers.bar._points[0].forEach((e,i)=>{
                              if(e.meta.stateColor[2] < 0.5){
                                  points[i].color  ='white'
                              }
                          })
                            return points;
                        },
                },
            ]);
		let rootData = new DataModel(jsonData, schema);

		rootData = rootData.groupBy(['Year','Cylinders'], {
			Horsepower: 'mean',
			Acceleration: 'mean'
		});

		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		let canvas2 = env.canvas();
		let canvas3 = env.canvas();
		let rows = [  'Cylinders'],
			columns = [['Year']];
		canvas = canvas
			.rows(rows)
			.columns(columns)
            .data(rootData)
			.width(1200)
            .height(700)
            .layers([{
                mark: 'heatMapText',
                encoding: {
                    text: {
                        field: 'Horsepower'
                    }
                }
            }])
            .color({
                field: 'Horsepower',
                // scheme: 'interpolateGreens',
                // step: false

                // interpolate: true
            })
            
            .config({
                border:{
                    width: 2,
                },
                axes:{
                        x:{
                            showAxisName: true,
                            padding: 0,
                            axisNamePadding: 20
                        
                    }, y:{
                        showAxisName: true,
                        padding: 0,
                        // name: 'Acceleration per year',
                        axisNamePadding: 20
                    }
                }
            })

    
        .title('The Muze Project', { position: "top", align: "left",  })
		.subtitle('Composable visualisations with a data first approach', { position: "top", align: "left" })
		.mount(document.getElementsByTagName('body')[0]);
	})

})()
