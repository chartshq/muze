d3.json('../data/cars.json', (data) => {
    // load data and schema from url
    const schema = [{
        name: 'Name',
        type: 'dimension'
    }, {
        name: 'Maker',
        type: 'dimension'
    }, {
        name: 'Miles_per_Gallon',
        type: 'measure',
        defAggFn: 'avg'
    }, {
        name: 'Displacement',
        type: 'measure',
        defAggFn: 'max'
    }, {
        name: 'Horsepower',
        type: 'measure',
        defAggFn: 'avg'
    }, {
        name: 'Weight_in_lbs',
        type: 'measure',
        defAggFn: 'min'
    }, {
        name: 'Acceleration',
        type: 'measure',
        defAggFn: 'avg'
    }, {
        name: 'Origin',
        type: 'dimension'
    }, {
        name: 'Cylinders',
        type: 'dimension'
    }, {
        name: 'Year',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }];
    // Get reference of dom element on which the chart will be rendered
    const mountPoint = document.getElementById('chart');

    // Retrieves the DataModel from muze namespace. Muze recognizes DataModel as a first class source of data.
    const DataModel = window.muze.DataModel;
    // Create an environment for future rendering
    const env = window.muze();

    // Create an instance of DataModel using the data and schema.
    const rootData = new DataModel(data, schema);

    // Create an instance of canvas which houses the visualization
    let canvas = env.canvas();

    canvas = canvas.rows(['Acceleration']) // Acceleration goes in Y-Axis
    .columns(['Year']) // Year goes in X-Axis
    .color('Origin') // Create multiseries by applying Origin in color encoding channel
    .config({
        interaction: {
            tooltip: {
                mode: 'fragmented' // fragmented tooltip view
            } } }).data(rootData) //  Feed data
    .width(800).height(500).title('The car acceleration respective to origin', { position: 'bottom', align: 'left' }).subtitle('Change of Acceleration of cars from 1970 - 1982', { position: 'top', align: 'left' }).mount(mountPoint); // Render on the DOM el
    canvas.once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
