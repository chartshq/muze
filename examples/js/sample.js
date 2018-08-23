/* eslint-disable */

(function () {
    let env = muze();
    let DataModel = muze.DataModel,
        share = muze.operators.share,
        html = muze.operators.html,
        actionModel = muze.ActionModel;
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

		// rootData = rootData.groupBy(['Year', 'Maker'], {
		// 	Horsepower: 'mean',
		// 	Displacement: 'mean'
        // });
        rootData = rootData.calculateVariable(
            {
                name: 'Actual_Displacement',
                type: 'measure'
            }, ['Displacement', (ac) =>{
                if(ac<500){
                    return -ac;
                } return ac
            }]
            );
       rootData = rootData.calculateVariable({
        name: 'negativeValues',
        type: 'dimension'
       }, ['Actual_Displacement',(y)=>{
           if(y<0){
               return 'Less than Zero'
           } else return 'Greater than Zero'
       }])
    //    rootData = rootData.groupBy(['Year', 'negativeValues'])
     
		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		let canvas2 = env.canvas();
		let canvas3 = env.canvas();
		let rows = ['Acceleration'],
            columns = [ 'Cylinders'];
            canvas2 = canvas2
			.rows(rows)
            .columns(['Origin'])
            // .color('Origin')
            .data(rootData)
			.width(500)
            .height(350)
            .config({
                //         border:{
                //             width: 2,
                          legend:{
                            //   position: 'bottom'
                          },
                
                        axes:{
                                x:{
                                    showAxisName: true,
                                  
                                
                            }, y:{
                                showAxisName: true,
                                // name: 'Acceleration per year',
                                // axisNamePadding: 12
                            }
                        },
                //         legend: {
                //             color:{
                //             // show: false
                //             }
                //         }
                    })
            .mount(document.getElementById('chart'));
		canvas = canvas
			.rows(rows)
            .columns(columns)
            // .color({field: 'Acceleration', step: true})
            .color('Origin')
            .data(rootData)
			.width(700)
            .height(350)
        //     // .size()
        //     .layers([{
        //         mark: 'point',
        //         encoding: {
        //             y: 'Horsepower'
        //         }
             
        //     }])
        //     // .size('Origin')
            .config({
        //         border:{
        //             width: 2,
                  legend:{
                    //   position: 'bottom'
                  },
        
                axes:{
                        x:{
                            showAxisName: true,
                          
                        
                    }, y:{
                        showAxisName: true,
                        // name: 'Acceleration per year',
                        // axisNamePadding: 12
                    }
                },
        //         legend: {
        //             color:{
        //             // show: false
        //             }
        //         }
            })

    
        .title('The Muze Project', { position: "top", align: "left",  })
		.subtitle('Composable visualisations with a data first approach', { position: "top", align: "left" })
        .mount(document.getElementById('chart2'));
        
        setTimeout(function(){
        // console.log(    canvas.layout().pages('column')) 
        }, 2000)
	})

})()
