/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataTable = muze.DataTable,
		share = muze.operators.share,
		html = muze.operators.html,
		Board = muze.Board;
		window.board = new Board();


	d3.csv('../../../data/coffee.csv', (data) => {
		const jsonData = data,
			schema = [{
					name: 'Market',
					type: 'dimension'
				},
				{
					name: 'Product',
					type: 'dimension'
				},
				{
					name: 'Product Type',
					type: 'dimension'
				},

				{
					name: 'Revenue',
					type: 'measure'
				},
				{
					name: 'Expense',
					type: 'measure'
				},
				{
					name: 'Profit',
					type: 'measure',
				},
				{
					name: 'Order Count',
					type: 'measure'
				},
			];
        let rootData = new DataTable(jsonData, schema);


		rootData = rootData.groupBy(['Market', 'Product Type', 'Product'], {

		});

		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		let mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		let canvas2 = env.canvas();
		let canvas3 = env.canvas();
		let rows = [[ 'Market', 'Product Type', 'Product']],
			columns = [['Revenue', 'Expense', 'Profit', 'Order Count'], []];
		canvas = canvas
			.rows(rows)
			.columns(columns)
            .data(rootData)
            .minUnitHeight(10)
			.width(900)
            .height(2000)
            .config({
                border:{
                    width: 2,
                    // showRowBorders: false,
                    // showColBorders:false,
                    // showValueBorders: {
                    //     top: false,
                    //     bottom: true,
                    //     left: true,
                    //     right: false
                    // }
                },
                axes:{
                        x:{
                            showAxisName: true,
                            tickFormat : (d)=>{
                                if(d<1000) return d;
                                if(d>1000 && d<1000000) return `${d/1000}K`
                                if(d>1000000) return `${d/1000}M`
                                return d
                            }


                    }, y:{
                        // showAxisName: true,
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
