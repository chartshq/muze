/* eslint-disable */

(function () {
    let env = muze();
    let DataModel = muze.DataModel,
        share = muze.operators.share,
        html = muze.operators.html,
        ActionModel = muze.ActionModel;

        let layerFactory = muze.layerFactory;
    const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;
    const GenericBehaviour = muze.Behaviours.standards.GenericBehaviour;


	d3.csv('../data/socialMedia.csv', (data) => {
   
		const jsonData = data,
			schema = [
                {
					name: 'Media',
					type: 'dimension'
				},
                {
					name: 'Year',
					type: 'dimension'
				},
				{
					name: 'value',
					type: 'measure'
				},

            ];
            delete jsonData.columns;
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
  
		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        DataModel.calculateVariable({
            name: 'va',
            type: 'measure',
        }, ['Horsepower', 'Weight', (hp, weight)=>{}])
		let rows = [  'value'],
            columns = [['Year'], ['Year']];
		canvas = canvas
			.rows(rows)
            .columns(columns)
            .data(rootData)
			.width(600)
            .height(700)
            .color({
                field: 'Media',
                range:['red', 'orange', 'yellow', '#33b5e91', '#31a6ea', 'grey', 'red', 'green']
            })
            .layers([{
                mark: 'line',
                connectNullData: true
            },{
                mark: 'point',
                connectNullData: true
            }])
            .config({
                border:{
                    width: 2,
                    showValueBorders:{
                        left: false,
                        top: false,
                        bottom: false,
                        right: false
                    }
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

    
        // .title('The Muze Project', { position: "top", align: "left",  })
		// .subtitle('Composable visualisations with a data first approach', { position: "top", align: "left" })
        .mount(document.getElementsByTagName('body')[0]);
        })

})()
