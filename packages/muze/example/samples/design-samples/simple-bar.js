d3.json('/data/cars.json', (data) => {
    // load data and schema from url
    const schema = [{
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
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }];
    const DataModel = window.muze.DataModel;
    const dm = new DataModel(data, schema);
    const html = muze.Operators.html;
    const env = window.muze();
    const canvas = env.canvas();
    canvas.data(dm).width(600).height(400).rows(['Horsepower']).columns(['Weight_in_lbs']).color({
        field: 'Miles_per_Gallon'
        // stops: [15, 30, 45, 60]
    }).detail(['Name']).mount('#chart').title('The car acceleration respective to origin', { position: 'bottom', align: 'left' });
    canvas.once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});