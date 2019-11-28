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

var data = [{
    "Horsepower": 130,
    "Acceleration": null,
    "Origin": "USA"
}, {
    "Horsepower": 115,
    "Acceleration": 17.5,
    "Origin": "Europe"
}, {
    "Horsepower": null,
    "Acceleration": 15,
    "Origin": "Japan"
}, {
    "Horsepower": 120,
    "Acceleration": 13.9,
    "Origin": "India"
}, {
    "Horsepower": 102,
    "Acceleration": 15.7,
    "Origin": null
}];
var rootData = new DataModel(data, schema, null, { dataFormat: "FlatJSON" });

var canvas = env.canvas();
var rows = ["Acceleration"];
var columns = [];
canvas.mount(mountPoint).width(600).data(rootData).rows(columns).height(500).columns(rows).layers([{
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
})