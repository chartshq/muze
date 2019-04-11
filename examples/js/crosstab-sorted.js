/* eslint-disable */

(function () {
	let env = window.muze();
	let DataModel = window.muze.DataModel;

	d3.json('/data/cars.json', (data) => {
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
        window.dm = new DataModel(jsonData, schema);
        const canvas = env.canvas();

        canvas
            .data(dm)
            .width(850)
            .height(550)
            .rows(["Acceleration", "Year"])
            .columns(["Origin"])
            .mount("#chart")
            // .layers([{
            //   mark: 'area'
            // }])
            .config({
                showHeaders: true,
                sort: {
					Somefield: 'desc',
        			AnotherField: (a, b) => b - a,
					// Cylinders: "desc",
					'Origin': 'asc'
                    // Year: (a, b) => b - a,
                    // Name: (a, b) => b.localeCompare(a)
                },
                axes: {
                    x: {
                        name: "aaa"
                    }
                }
            });
	})
})()
