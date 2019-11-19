(function () {
    let env = window.muze();
    let DataModel = window.muze.DataModel,
	    share = window.muze.Operators.share,
	    html = window.muze.Operators.html;

    d3.json('/data/cars.json', (data) => {
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
			// subtype: 'temporal',
			// format: '%Y-%m-%d'
    }];
        const rootData = new DataModel(jsonData, schema);

        // rootData = rootData.groupBy(['Year', 'Origin'], {
        //     Horsepower: 'mean',
        //     Acceleration: 'mean'
        // });

        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        let rows = ['Horsepower'],
            columns = ['Displacement'];

        canvas = canvas
                .rows(rows)
                .columns(columns)
                .data(rootData)
                .width(900)
                .height(600)
                .color({
                    field: 'Horsepower',
                    step: true
                    // stops: 10
                    // range: ['#BBF6F0', '#85ECE1', '#50C0B5', '#12877B', '#005F56']
                })
                // // .color('Maker')
                .detail('Maker')
                .config({
                    legend: {
                        position: 'bottom'
                    }
                }).mount(mountPoint).once('canvas.animationend').then((client) => {
                    const element = document.getElementById('chart');
                    element.classList.add('animateon');
                });
    });
}());
