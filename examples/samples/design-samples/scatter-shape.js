/* eslint-disable */

(function () {
    let env = window.muze();
    let DataModel = window.muze.DataModel;
    const html = window.muze.Operators.html;

    d3.json('/data/cars.json', (data) => {
        const schema = [{
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
        }];
        let rootData = new DataModel(data, schema);

        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        window.canvas = env.canvas();
        
        canvas
        .data(rootData)
		.width(850)
		.height(650)
		.rows(["Acceleration"])
		.columns(["Year"])
		.color("Origin")
		.layers([{
			mark: 'bar',
		}])
		.mount(document.getElementById('chart'));
        
        canvas.once('canvas.animationend').then(function (client) {
            var element = document.getElementById('chart');
            canvas.legend().color.firebolt().dispatchBehaviour('select', {
                criteria: [["Origin"],["USA"]]
            });
            console.log('hovering on USA legend item');
            canvas.legend().color.firebolt().dispatchBehaviour('highlight', {
                criteria: [["Origin"],["USA"]]
            });
            element.classList.add('animateon');
        });
    })
})()
