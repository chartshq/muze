/* eslint disable */
const env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    const jsonData = data;
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
        type: 'measure'
    },
    {
        name: 'Horsepower',
        type: 'measure'
    },
    {
        name: 'Weight_in_lbs',
        type: 'measure'
    },
    {
        name: 'Acceleration',
        type: 'measure'
    },
    {
        name: 'Origin',
        type: 'dimension'
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

    const rootData = new DataModel(jsonData, schema);
    let rows = ['Horsepower'],
        columns = ['Year'];
    canvas = env.data(rootData).canvas().rows(rows).columns(columns).height(650).color('Maker').width(800).minUnitWidth(40)
    .config({
        axes: {
            x: {
                // show: false
            }
        },
        border: {
            width: -100
        },
        legend: {
            position: 'right'
        },
        invalidValues: {
            null: 'No Data Value is present in this particular tooltip'
        }
    })
// {rows}
.mount('#chart');

    setTimeout(() => {
        canvas.once('canvas.animationend').then((client) => {
            const element = document.getElementById('chart');
            element.classList.add('animateon');
        });
        // canvas.data(rootData)
        // canvas.config({
        //     axes: {
        //         y: {
        //             tickFormat: function tickFormat (val) {
        //                 return `${val}$`;
        //             }
        //         },
        //         x: {
        //             tickFormat: function tickFormat (val) {
        //                 return `${val}%%`;
        //             }
        //         }
        //     }
        // })
        // .width(400).height(300);
    }, 2000);
});

