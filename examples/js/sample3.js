/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
        let jsonData = data,
		    schema = [{
        name: 'Name',
        type: 'dimension'
    }, {
        name: 'Maker',
        type: 'dimension'
    }, {
        name: 'Miles_per_Gallon',
        type: 'measure'
    }, {
        name: 'Displacement',
        type: 'measure'
    }, {
        name: 'Horsepower',
        type: 'measure'
    }, {
        name: 'Weight_in_lbs',
        type: 'measure'
    }, {
        name: 'Acceleration',
        type: 'measure'
    }, {
        name: 'Origin',
        type: 'dimension'
    }, {
        name: 'Cylinders',
        type: 'dimension'
    }, {
        name: 'Year',
        type: 'dimension'
			// subtype: 'temporal',
			// format: '%Y-%m-%d'
    }];
        const rootData = new DataModel(jsonData, schema);

        env = env.data(rootData).minUnitHeight(140).minUnitWidth(140);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        var rows = ['Acceleration', 'Horsepower'],
        columns = ['Year'];
    canvas = canvas.rows(rows).columns(columns).data(rootData).width(300).height(400).mount(mountPoint)
    .config({
        scrollBar:{
            thickness: 5
            // vertical:{
            //     align: 'left'
            // }
        }
    })

        canvas.onAnimationEnd((client) => {

            const element = document.getElementById('chart');
            element.classList.add('animateon');
        });
    });
}());

