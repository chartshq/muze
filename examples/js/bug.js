const env = window.muze();
const DataModel = window.muze.DataModel;
const mountPoint = document.getElementById('chart');

const schema = [{
    name: 'Horsepower',
    type: 'measure'
}, {
    name: 'Acceleration',
    type: 'measure'
}, {
    name: 'Origin',
    type: 'dimension'
}];

// const data = [{ Origin:'USA', Horsepower:1, Acceleration:2 },{Origin:'China', Horsepower:2}];
const data1 = [{ Origin: '1' }, { Origin: '2' }];
const rootData = new DataModel(data1, schema, { dataFormat: "FlatJSON" } );
const canvas = env.canvas();
const rows = [[], ['Acceleration']];
const columns = ['Origin'];
canvas.mount(mountPoint).data(rootData).rows(rows).height(400)
.columns(columns)
.layers([{
    mark: 'point'
}])
.color({
    field: 'Origin'
});
