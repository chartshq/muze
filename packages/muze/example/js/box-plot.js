/* eslint disable */

const DataModel = window.muze.DataModel;

const share = window.muze.operators.share;
const layerFactory = window.muze.layerFactory;

const schema = [{
    name: 'organ',
    type: 'dimension'
},
{
    name: 'minValue',
    type: 'measure'
},
{
    name: 'meanValue',
    type: 'measure'
},
{
    name: 'maxValue',
    type: 'measure'
},
{
    name: 'quarter',
    type: 'measure'
},
{
    name: 'thirdQuarter',
    type: 'measure'
}
];

layerFactory.composeLayers('boxMark', [
    {
        name: 'leftTick',
        className: 'leftTick',
        mark: 'tick',
        encoding: {
            x: 'boxMark.encoding.quarter',
            x0: 'boxMark.encoding.minValue'
        },
        interactive: false
    },
    {
        name: 'lowerBand',
        mark: 'bar',
        className: 'lowerBand',
        encoding: {
            x0: 'boxMark.encoding.meanValue',
            x: 'boxMark.encoding.quarter',
            color: {
                value: () => 'rgba(30,119,180,0.75)'
            }
        },
        transform: {
            type: 'identity'
        },
        transition: {
            disabled: true
        }
    },
    {
        name: 'upperBand',
        mark: 'bar',
        className: 'upperBand',
        encoding: {
            x: 'boxMark.encoding.thirdQuarter',
            x0: 'boxMark.encoding.meanValue',
            color: {
                value: () => 'rgba(30,119,180,0.35)'
            }
        },
        transform: {
            type: 'identity'
        },

        transition: {
            disabled: true
        }
    },
    {
        name: 'rightTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            x: 'boxMark.encoding.maxValue',
            x0: 'boxMark.encoding.thirdQuarter'
        },
        interactive: false
    },
    {
        name: 'minTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            x: 'boxMark.encoding.minValue',
            y: 'boxMark.encoding.y',
            shape: {
                value: 'line'
            }
        },
        interactive: false
    },
    {
        name: 'maxTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            x: 'boxMark.encoding.maxValue',
            y: 'boxMark.encoding.y'
        },
        interactive: false
    },
    {
        name: 'meanTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            x: 'boxMark.encoding.meanValue',
            y: 'boxMark.encoding.y'
        },
        interactive: false
    }
]);

let sharedField;
const columns = [sharedField = share('minValue', 'meanValue', 'maxValue', 'quarter', 'thirdQuarter')];
const rows = ['organ'];

// Create a muze instance
let env = window.muze();

d3.json('../data/iris.cleared.json', (data) => {
    const dt = new DataModel(data, schema);
	// Specify some global chart configurations
    env = env.width(800)
		.height(600)
		.data(dt);

    let canvas = env.canvas();

	// Takes the rest of the config from global renderer
    canvas = canvas
		.rows(rows)
		.columns(columns)
		.layers([{
    mark: 'boxMark',
    encoding: {
        minValue: 'minValue',
        meanValue: 'meanValue',
        y: 'organ',
        maxValue: 'maxValue',
        quarter: 'quarter',
        thirdQuarter: 'thirdQuarter'
    },
    transform: {
        type: 'identity'
    },
}])
// .color('organ')
        .mount(document.getElementsByClassName('chart')[0]);
});
