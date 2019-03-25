/* eslint-disable */
d3.json('../data/iris.cleared.json', function (data) {
    // load data and schema from url
    var schema = [
        {
            "name": "organ",
            "type": "dimension",
            displayName: "organ2"
        },
        {
            "name": "minValue",
            "type": "measure",
            displayName: "minValue2"
        }, {
            "name": "meanValue",
            "type": "measure",
            displayName: "meanValue2"
        }, {
            "name": "maxValue",
            "type": "measure",
            displayName: "maxValue2"
        }, {
            "name": "quarter",
            "type": "measure",
            displayName: "quarter2"
        }, {
            "name": "thirdQuarter",
            "type": "measure",
            displayName: "thirdQuarter2"
        }
    ];
    var layers = [
        {
            "name": "maxTick",
            "mark": "tick",
            "className": "boxTicks",
            "encoding": {
                "y": "boxMark.encoding.maxValue",
                "x": "boxMark.encoding.x"
            },
            "interactive": false
        }, {
            "name": "upperTick",
            "className": "upper-tick",
            "mark": "tick",
            "encoding": {
                "y": "boxMark.encoding.quarter",
                "x": "boxMark.encoding.x",
                "y0": "boxMark.encoding.minValue"
            },
            "interactive": false
        }, {
            "name": "upperBand",
            "mark": "bar",
            "className": "upperBand",
            "encoding": {
                "y": "boxMark.encoding.thirdQuarter",
                "x": "boxMark.encoding.x",
                "y0": "boxMark.encoding.meanValue",
                "color": "boxMark.encoding.color"
            },
            "transform": {
                "type": "identity"
            }
        }, {
            "name": "meanTick",
            "mark": "tick",
            "className": "boxTicks",
            "encoding": {
                "y": "boxMark.encoding.meanValue",
                "x": "boxMark.encoding.x"
            },
            "interactive": false
        }, {
            "name": "lowerBand",
            "mark": "bar",
            "className": "lowerBand",
            "encoding": {
                "y0": "boxMark.encoding.meanValue",
                "x": "boxMark.encoding.x",
                "y": "boxMark.encoding.quarter",
                "color": "boxMark.encoding.color"
            },
            "transform": {
                "type": "identity"
            }
        }, {
            "name": "lowerTick",
            "mark": "tick",
            "className": "boxTicks",
            "encoding": {
                "y": "boxMark.encoding.maxValue",
                "x": "boxMark.encoding.x",
                "y0": "boxMark.encoding.thirdQuarter"
            },
            "interactive": false
        }, {
            "name": "minTick",
            "mark": "tick",
            "className": "boxTicks",
            "encoding": {
                "y": "boxMark.encoding.minValue",
                "x": "boxMark.encoding.x"
            },
            "interactive": false
        }];

    var DataModel = window.muze.DataModel;
    var rootData = new DataModel(data, schema);
    // Registry for user defined layers
    var layerFactory = muze.layerFactory;
    // Compose share operator for plotting multiple variable in one Y-axis
    var share = muze.Operators.share;

    var html = window.muze.Operators.html;

    // Create a global environment to share common configs across charts 
    var env = window.muze();
    // Set height, width and data to env, so that every instance of canvas which gets created from the environment
    // receives this
    env.width(600).height(600).data(rootData);

    var canvas = env.canvas();

    // Use the custom layer definition to register a new layer and name it boxMark
    layerFactory.composeLayers('boxMark', layers);
    var sharedField = void 0;
    // Create a combined field which gets plotted in the Y-axis. Value of all those variables will be passed
    // to layers
    var columns = [sharedField = share('minValue', 'meanValue', 'maxValue', 'quarter', 'thirdQuarter')];
    var rows = ['organ'];

    canvas.rows(columns).columns(rows).color('organ').config({
        axes: {
            y: {
                showAxisName: true,
                name: 'Measure'
            }
        }
    }).layers([{
        mark: 'boxMark',
        encoding: { // Map the encoding with variables. These custom encodings are used in the composite layers.
            minValue: 'minValue',
            meanValue: 'meanValue',
            x: 'organ',
            maxValue: 'maxValue',
            quarter: 'quarter',
            thirdQuarter: 'thirdQuarter'
        }
    }]).mount(document.getElementById('chart'));

    canvas.once('canvas.animationend').then(function (client) {

        var element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});