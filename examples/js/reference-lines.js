/* eslint-disable */

// (function () {
// 	let env = window.muze();
// 	var DataModel = window.muze.DataModel;
// 	var layerFactory = muze.layerFactory;
// 	var groupBy = DataModel.Operators.groupBy;
//     var sort = DataModel.Operators.sort;

//     layerFactory.composeLayers('compositeBar', [
//         {
//             name: 'simplebar',
//             mark: 'bar',
//             encoding: {
//                 x: 'compositeBar.encoding.x',
//                 y: 'compositeBar.encoding.y',
//                 color: 'compositeBar.encoding.color',
//             },
//         },
//         {
//             name: 'averageLine',
//             mark: 'point',
//             dataSource: 'averageLine',
//             encoding: {
//                 shape: {
//                     value: 'line'
//                 },
//                 y: 'compositeBar.encoding.y'
//             }
//         },
//         {
//             name: 'averageText',
//             mark: 'text',
//             dataSource: 'averageLine',
//             encoding: {
//                 y: 'compositeBar.encoding.y',
//                 text: {
//                     field: 'compositeBar.encoding.y.field',
//                     formatter: (value) => {
//                         return `Average Horsepower: ${Math.round(value)}`;
//                     }
//                 },
//                 background: {
//                     enabled: true
//                 }
//             },
//             positioner: (points, store, layerInst) => {
//                 let width = store.visualunit.width();
//                 let smartLabel = layerInst.dependencies().smartLabel;
//                 for (let i = 0; i < points.length; i++) {
//                     let size = smartLabel.getOriSize(points[i].text);
//                     points[i].update.x = width;
//                     points[i].textanchor = 'end';
//                     points[i].update.y -= size.height / 2;
//                 }
//                 return points;
//             }
//         }
//     ]);
// 	d3.json('../../data/cars.json', (data) => {
// 		const jsonData = data,
// 			schema = [{
// 					name: 'Name',
// 					type: 'dimension'
// 				},
// 				{
// 					name: 'Maker',
// 					type: 'dimension'
// 				},
// 				{
// 					name: 'Miles_per_Gallon',
// 					type: 'measure'
// 				},

// 				{
// 					name: 'Displacement',
// 					type: 'measure'
// 				},
// 				{
// 					name: 'Horsepower',
// 					type: 'measure'
// 				},
// 				{
// 					name: 'Weight_in_lbs',
// 					type: 'measure',
// 				},
// 				{
// 					name: 'Acceleration',
// 					type: 'measure'
// 				},
// 				{
// 					name: 'Origin',
// 					type: 'dimension'
// 				},
// 				{
// 					name: 'Cylinders',
// 					type: 'dimension'
// 				},
// 				{
// 					name: 'Year',
// 					type: 'dimension'
// 				},

// 			];
// 		let rootData = new DataModel(jsonData, schema);

// 		rootData = rootData.groupBy(['Year'], {
// 			Horsepower: 'avg',
// 			Acceleration: 'avg'
// 		});

// 		env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
// 		let mountPoint = document.getElementById('chart');
// 		window.canvas = env.canvas();
// 		let canvas2 = env.canvas();
// 		let canvas3 = env.canvas();
// 		let rows = ['Horsepower'],
// 			columns = ['Year'];
// 		canvas = canvas
// 			.rows(rows)
// 			.columns(columns)
// 			.data(rootData)
//             // .color('Displacement')
//             .transform([
//                 ['averageLine', [(dt) => dt.groupBy([''], { Horsepower: 'avg'})]]
//             ])
//             .layers({
//                 Horsepower: {
//                     mark: 'compositeBar',
//                 }
//             })
//             .width(800)
//             .height(400)
//             .mount(mountPoint);
// 	})

// })()

d3.json('../../data/cars.json', function (data) {
    // load data and schema from url
    // Retrieves the DataModel from muze namespace. Muze recognizes DataModel as a first class source of data.
    var DataModel = window.muze.DataModel;
    // Get the factory to compose new layers
    var layerFactory = muze.layerFactory;
    // Import the reference to the DataModel operator
    var groupBy = DataModel.Operators.groupBy;
    var sort = DataModel.Operators.sort;

    // Compose layers to draw the bars as well as the reference line and text
    layerFactory.composeLayers('compositeBar', [{
        name: 'simplebar',
        mark: 'bar',
        encoding: {
            x: 'compositeBar.encoding.x',
            y: 'compositeBar.encoding.y',
            color: 'compositeBar.encoding.color'
        }
    }, {
        name: 'averageLine',
        mark: 'tick',
        source: 'averageLine',
        className: 'averageLine',
        encoding: {
            y: 'compositeBar.encoding.y',
            x: null
        },
        calculateDomain: false
    }, {
        name: 'averageText',
        mark: 'text',
        source: 'averageLine',
        className: 'averageText',
        encoding: {
            y: 'compositeBar.encoding.y',
            text: 'compositeBar.encoding.text',
            background: {
                enabled: true
            }
        },
        encodingTransform: function encodingTransform(points, layer, dependencies) {
            // Transforms the test after the physical dimension is resolved so that it comes in the middle of the background
            var width = layer.measurement().width;
            var smartLabel = dependencies.smartLabel;
            for (var i = 0; i < points.length; i++) {
                var size = smartLabel.getOriSize(points[i].text);
                points[i].update.x = width - 5;
                points[i].textanchor = 'end';
                points[i].update.y -= size.height / 2;
                points[i].color = '#000';
            }
            return points;
        },
        calculateDomain: false
    }]);

    // Schema for the data
    var schema = [{ name: 'Name', type: 'dimension' }, { name: 'Maker', type: 'dimension' }, { name: 'Miles_per_Gallon', type: 'measure', defAggFn: 'max' }, { name: 'Displacement', type: 'measure', defAggFn: 'max' }, { name: 'Horsepower', type: 'measure', defAggFn: 'avg' }, { name: 'Weight_in_lbs', type: 'measure', defAggFn: 'min' }, { name: 'Acceleration', type: 'measure', defAggFn: 'avg' }, { name: 'Origin', type: 'dimension' }, { name: 'Cylinders', type: 'dimension' }, { name: 'Year', type: 'dimension' }];

    var rootData = new DataModel(data, schema);

    // Apply groupBy and sorting from outside muze. Muze internally perfoms gouping of data to eliminate duplicate data. Sorting followed by groupBy does not
    // ensure retention of the order of data defined by sorting. Hence we do grouping and sorting from outside the visualizaiton.
    rootData = groupBy(['Year'], {
        Horsepower: 'max',
        Acceleration: 'avg'
    })(rootData);
    rootData = sort([['Horsepower', 'DESC']])(rootData);

    // Create an environment for future rendering
    var env = window.muze();
    // Create an instance of canvas which houses the visualization
    var canvas = env.canvas();

    canvas = canvas.rows(['Horsepower']) // Horsepower goes in Y-Axis
    .columns(['Year']) // Year goes in X-Axis
    .data(rootData).transform({ // Create different sources (data) from the root source (data). Layers can access these sources and draw any visualization
        'averageLine': function averageLine(dt) {
            return dt.groupBy([''], { Horsepower: 'avg' });
        } // Removes all the dim and aggregate the measures
    }).layers([{
        mark: 'compositeBar',
        encoding: {
            text: {
                field: 'Horsepower',
                formatter: function formatter(value) {
                    return 'Average Horsepower: ' + Math.round(value);
                }
            }
        }
    }]).config({
        autoGroupBy: { // Dont perform groupBy internally, as sorting order was specified
            disabled: true
        }
    }).width(600).height(400)
    //.title('Sorted bar with trendline', { position: "top", align: "left", })
    .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' }).subtitle('Average horsepower per year with average horsepower of all time marked as reference', { position: "top", align: "left" }).mount(document.getElementById('chart'));

    canvas.once('canvas.animationend').then(function (client) {
        var element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
