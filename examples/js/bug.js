var env = window.muze();
var DataModel = window.muze.DataModel;
var mountPoint = document.getElementById('chart');

var schema = [{
    name: 'Horsepower',
    type: 'measure'
}, {
    name: 'Acceleration',
    type: 'measure'
}, {
    name: 'Origin',
    type: 'dimension'
}];

var data = [{ Origin:'USA' },{Origin:'China'}];
var rootData = new DataModel(data, schema, { dataFormat: "FlatJSON" } );
var canvas = env.canvas();
var rows = [];
var columns = [];
canvas.mount(mountPoint).width(600).data(rootData).rows(rows).height(500).columns(columns).layers([{
    mark: 'arc'
}]).color({
    field: 'Origin'
}).config({
    axes: {
        x: {
            showAxisName: true
        },
        y: {
            showAxisName: true
        }
    }
});