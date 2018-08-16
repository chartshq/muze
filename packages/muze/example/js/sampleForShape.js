/* eslint-disable */

(function () {
	let env = muze.Muze();
	let DataModel = muze.DataModel,
		share = muze.operators.share;

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
					// subtype: 'temporal',
					// format: '%Y-%m-%d'

				},

			];
		let rootData = new DataModel(jsonData, schema);

		rootData = rootData.groupBy(['Cylinders', 'Origin'], {
			Horsepower: 'mean',
			Acceleration: 'mean'
		});
		env = env.width(1200)
			.height(500)
			.data(rootData);
		let canvas = env.canvas();
		let rows = [ 'Displacement'],
			columns = [ 'Acceleration'],
			color = 'Cylinders',
			size = 'Origin';

		canvas
			.rows(rows)
			.columns(columns)
			.size('Origin', {
                scaleFactor: 20,
            })
            .shape('Cylinders', {
                generator:()=>{
                    let svgImage=document.createElementNS("http://www.w3.org/2000/svg","image");
                    svgImage.setAttribute('href', 'https://image.flaticon.com/icons/svg/912/912316.svg')

                    let htmlImage=document.createElementNS("http://www.w3.org/1999/xhtml","img");
                    htmlImage.setAttribute('src', 'https://image.flaticon.com/icons/svg/912/912316.svg')
                    let pathVar=document.createElementNS("http://www.w3.org/2000/svg","path");
                    pathVar.setAttribute('d', 'M150 0 L75 200 L225 200 Z')
                    return pathVar;
                    // return htmlImage;
                    // return svgImage;
                    // return 'M150 0 L75 200 L225 200 Z';
                }
            })
            .layers({
                'Acceleration':{
                    mark:'point',
                        scaleFactor: 100
                }
            })
			.minUnitWidth(20)
			.minUnitHeight(50)
			.mount(document.getElementsByTagName('body')[0]);

	});
})()
