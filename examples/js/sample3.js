/* eslint-disable */

(function () {
	var env = window.muze();
	var DataModel = window.muze.DataModel;

	d3.json('/data/cars.json', function (data) {
		var jsonData = data,
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
		var rootData = new DataModel(jsonData, schema);

		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
		var mountPoint = document.getElementById('chart');
		window.canvas = env.canvas();
		canvas = canvas.rows(['Acceleration', 'Horsepower', 'Weight_in_lbs']).columns(['Cylinders']).data(rootData).height(200).width(200).mount(mountPoint);

		canvas.once('canvas.animationend').then(function (client) {
			console.log("animation done");
			var element = document.getElementById('chart');
			element.classList.add('animateon');
		});
	});
})();