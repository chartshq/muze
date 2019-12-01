const env = muze();
const DataModel = muze.DataModel;
d3.json('../data/cars.json', (data) => {
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
        // {subtype}
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
        }];
    const rootData = new DataModel(jsonData, schema);
    const mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    canvas.data(rootData).width(600).height(400).rows(['Weight_in_lbs']).columns(['Horsepower']).detail(['Name']).size({
        field: 'Horsepower', // Size retinal encoding with Displacement
        stops: [0, 50, 400, 700]
    }).mount(mountPoint).once('canvas.animationend').then((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});
