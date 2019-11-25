/* eslint-disable */

(function () {
    let env = window.muze();
    const DataModel = window.muze.DataModel;

    d3.json('/data/cars.json', (data) => {
        // data = [{
        //     Cylinders: '5',
        //     Acceleration: 1
        // }, {
        //     Cylinders: '6',
        //     Acceleration: 0.4
        // }, {
        //     Cylinders: '7',
        //     Acceleration: 0.6
        // }, {
        //     Cylinders: '9',
        //     Acceleration: 0.2
        // }];

        const schema = [{
            name: 'Name',
            type: 'dimension'
        },
        {
            name: 'Maker',
            type: 'dimension'
        },
        {
            name: 'Miles_per_Gallon',
            type: 'measure'
        },
        {
            name: 'Displacement',
            type: 'measure',
            defAggFn: 'min'
        },
        {
            name: 'Horsepower',
            type: 'measure'
        },
        {
            name: 'Weight_in_lbs',
            type: 'measure',
			numberFormat: (val) => "ï¿¡" + val
        },
        {
            name: 'Acceleration',
            type: 'measure',
        },
        {
            name: 'Origin',
            type: 'dimension',
            displayName: "Origin2"
        },
        {
            name: 'Cylinders',
            type: 'dimension'
        },
        {
            name: 'Year',
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }
        ];

    let rootData = new DataModel(data, schema)

    // rootData = rootData.sort([
    //     ['Cylinders', 'asc'],
    // ])

    // rootData = rootData.sort([
    //     ['Origin', 'desc'],
    // ])

    // rootData = rootData.project(['Cylinder','Origin','Acceleration','Maker'])

    const canvas = env.canvas();

    canvas
        .data(rootData)
        // .rows(['maxDays'])
        .columns(['Origin'])
        .rows(['Acceleration'])
        .color('Origin')
        // .detail(['Maker'])
        .mount('#chart')
        .height(650)
        .width(850)
        // .config({
        //     sort: {
        //         // Maker : 'asc',
        //         Origin: 'asc'
        //     }
        // })
        .title('Charts');
    });
})();
