/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

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
        type: 'dimension',
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }];
    const dm = new DataModel(jsonData, schema);
    const canvas = env.canvas();
    
    canvas
        .data(dm)
        .width(600)
        .height(700)
        .rows(['Weight_in_lbs'])
        .columns(['Name'])
        // .detail(['Name'])
        .mount('#chart') /* Attaching the canvas to DOM element */
        .layers([
            {
                mark: 'bar'
            }
        ])
        .config({
            sort: {
                Name: 'asc'
            }
        })

        setTimeout(() => {
            canvas.config(
                { sort: { Weight_in_lbs: 'desc' }},
                { reset: true },
            )
        }, 2000);
        

        setTimeout(() => {
            canvas.config({
                sort: {
                    Name: 'asc'
                },
                legend: { show: true }
            }, { reset: true })
        }, 4000);

        setTimeout(() => {
            canvas.config(
                { sort: { }},
                { reset: true },
            )
        }, 6000);

        setTimeout(() => {
            canvas.config(
                { sort: { Weight_in_lbs: 'asc' }},
                { reset: true },
            )
        }, 8000);
    });
}());