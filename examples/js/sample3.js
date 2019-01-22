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
    }];
        const rootData = new DataModel(jsonData, schema);
        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        let rows = ['Cylinders', 'Horsepower', 'Weight_in_lbs'],
		columns = ['Origin'];
	canvas = canvas
		.rows(rows)
		.columns(columns)
  .data(rootData)
	.color('Origin')
	.shape('Origin')
	.size('Origin')
  .width(500)
  .height(500)
  .mount(mountPoint)

        canvas.once('canvas.animationend').then((client) => {
            canvas.composition().vScrollBar.scrollToUnitIndex(10);
            const element = document.getElementById('chart');
            element.classList.add('animateon');
        });
    });
}());

