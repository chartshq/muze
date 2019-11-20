(function () {
    let env = window.muze();
    let DataModel = window.muze.DataModel,
	    share = window.muze.Operators.share,
	    html = window.muze.Operators.html;
    d3.json('/data/cars.json', (data) => {
        const jsonData = [{
            Cylinders: '5',
            Acceleration: 1
        }, {
            Cylinders: '6',
            Acceleration: 0.4
        }, {
            Cylinders: '7',
            Acceleration: 0.6
        }, {
            Cylinders: '9',
            Acceleration: 0.2
        }];
        const schema = [{
            name: 'Acceleration',
            type: 'measure'
        }, {
            name: 'Cylinders',
            type: 'dimension'
        }];
        const rootData = new DataModel(jsonData, schema);
        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        let rows = ['Acceleration'],
		    columns = ['Cylinders'];
        canvas = canvas.rows(rows).columns(columns).data(rootData).layers([{
            mark: 'bar'
        }]).width(900).height(600).color({
            field: 'Acceleration',
            step: true
        }).config({
            legend: {
                position: 'bottom'
            }
        }).mount(mountPoint);
    });
}());