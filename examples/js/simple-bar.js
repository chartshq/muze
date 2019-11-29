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

    // Create an instance of DataModel using the data and schema.
    let dm = new muze.DataModel(data, schema);
    // Sort the data. Before sorting groupBy needs to be performed. As grouping after sorting changes the order.
    // When sorting is applied, internal grouping of data inside muze has to be turned off.
    const filterMaker = ['bmw', 'honda', 'ford', 'volvo', 'volkswagen', 'audi', 'renault', 'toyota', 'dodge', 'chevrolet', 'plymouth'];
    dm = dm.groupBy(['Maker']).sort([['Acceleration', 'ASC']]);
    dm = dm.select(fields => filterMaker.indexOf(fields.Maker.value) > -1);
    // Create an environment for future rendering
    const env = window.muze();
    // Create an instance of canvas which houses the visualization
    const canvas = env.canvas();

    canvas.rows(['Maker']) // Year goes in X axis
    .columns(['Acceleration']) // Acceleration goes in Y axis
    .data(dm).color({
        field: 'Acceleration', // A measure in color encoding channel creates gradient legend
        stops: 10, // 3 stops with interpolated value
        range: ['#eaeaea', '#258e47'] // range could be either set of color or predefined palletes
    }).config({
        autoGroupBy: { // Turn off internal grouping of data because data has order wich needs to be maintained
            disabled: true
        },
        legend: {
            position: 'bottom'
        }
    }).width(600) // Set the chart width
    .height(400) // Set the chart height
    .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' })
    // .title('Bar chart with gradient legend', { position: 'bottom', align: 'right', })
    .subtitle('Change of acceleration over the years colored with Horsepower', { position: 'bottom', align: 'right' }).mount('#chart'); // Render on a dom element

    canvas.once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
