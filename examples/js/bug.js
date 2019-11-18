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

// var data = [{ Origin:'USA', Horsepower:1, Acceleration:2 },{Origin:'China', Horsepower:2}];
var data1 = [{ Horsepower:'1', Acceleration:'2' },{Horsepower:'2'}];
var rootData = new DataModel(data1, schema, { dataFormat: "FlatJSON" } );
var canvas = env.canvas();
var rows = [['Acceleration']];
var columns = ['Origin'];
canvas.mount(mountPoint).data(rootData).rows(rows).height(400).columns(columns).layers([{
    mark: 'point',
}]).color({
    field: 'Origin'
});