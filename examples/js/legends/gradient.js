/* eslint-disable */
let env = muze();
const DataModel = muze.DataModel;

d3.json('/data/cars.json', function (data) {
    const jsonData = data,
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
    const rootData = new DataModel(jsonData, schema);

    env = env.data(rootData);
    const mountPoint = document.getElementById('chart');
    const rows = ['Acceleration', 'Weight_in_lbs'],
        columns = ['Miles_per_Gallon'];
    env.canvas().rows(rows).columns(columns).data(rootData)
    .width(900)
    .height(600)
    .size({
        field: 'Horsepower'
    })
    .mount(mountPoint);
});
