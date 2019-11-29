d3.json('../data/iris.cleared.json', (data) => {
    // load data and schema from url
    const schema = [{
        name: 'organ',
        type: 'dimension'
    }, {
        name: 'minValue',
        type: 'measure'
    }, {
        name: 'meanValue',
        type: 'measure'
    }, {
        name: 'maxValue',
        type: 'measure'
    }, {
        name: 'quarter',
        type: 'measure'
    }, {
        name: 'thirdQuarter',
        type: 'measure'
    }];
    const layers = [{
        name: 'maxTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            y: 'boxMark.encoding.maxValue',
            x: 'boxMark.encoding.x'
        },
        interactive: false
    }, {
        name: 'upperTick',
        className: 'upper-tick',
        mark: 'tick',
        encoding: {
            y: 'boxMark.encoding.quarter',
            x: 'boxMark.encoding.x',
            y0: 'boxMark.encoding.minValue'
        },
        interactive: false
    }, {
        name: 'upperBand',
        mark: 'bar',
        className: 'upperBand',
        encoding: {
            y: 'boxMark.encoding.thirdQuarter',
            x: 'boxMark.encoding.x',
            y0: 'boxMark.encoding.meanValue',
            color: 'boxMark.encoding.color'
        },
        transform: {
            type: 'identity'
        }
    }, {
        name: 'meanTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            y: 'boxMark.encoding.meanValue',
            x: 'boxMark.encoding.x'
        },
        interactive: false
    }, {
        name: 'lowerBand',
        mark: 'bar',
        className: 'lowerBand',
        encoding: {
            y0: 'boxMark.encoding.meanValue',
            x: 'boxMark.encoding.x',
            y: 'boxMark.encoding.quarter',
            color: 'boxMark.encoding.color'
        },
        transform: {
            type: 'identity'
        }
    }, {
        name: 'lowerTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            y: 'boxMark.encoding.maxValue',
            x: 'boxMark.encoding.x',
            y0: 'boxMark.encoding.thirdQuarter'
        },
        interactive: false
    }, {
        name: 'minTick',
        mark: 'tick',
        className: 'boxTicks',
        encoding: {
            y: 'boxMark.encoding.minValue',
            x: 'boxMark.encoding.x'
        },
        interactive: false
    }];

    const DataModel = window.muze.DataModel;
    const rootData = new DataModel(data, schema);
    // Registry for user defined layers
    const layerFactory = muze.layerFactory;
    // Compose share operator for plotting multiple variable in one Y-axis
    const share = muze.Operators.share;

    // Create a global environment to share common configs across charts
    const env = window.muze();
    // Set height, width and data to env, so that every instance of canvas which gets created from the environment
    // receives this
    env.height(400).width(400).data(rootData);

    const canvas = env.canvas();

    // Use the custom layer definition to register a new layer and name it boxMark
    layerFactory.composeLayers('boxMark', layers);
    let sharedField = void 0;
    // Create a combined field which gets plotted in the Y-axis. Value of all those variables will be passed
    // to layers
    const columns = [sharedField = share('minValue', 'meanValue', 'maxValue', 'quarter', 'thirdQuarter')];
    const rows = ['organ'];

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
    }]).subtitle('The car acceleration respective to origin', { position: 'bottom', align: 'center' }).mount(document.getElementById('chart'));

    canvas.once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
