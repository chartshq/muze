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
    canvas = env
    .canvas()
    .rows(['Maker']) // Year goes in X axis
    .columns(['Acceleration']) // Acceleration goes in Y axis
    .data(rootData)
    .color({
        field: 'Acceleration', // A measure in color encoding channel creates gradient legend
        stops: 3, // 3 stops with interpolated value
        range: ['#eaeaea', '#258e47'] // range could be either set of color or predefined palletes
    })
    .config({
        autoGroupBy: { // Turn off internal grouping of data because data has order wich needs to be maintained
            disabled: true
        }
    })
    .width(600) // Set the chart width
    .height(400) // Set the chart height
    .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' })
    // .title('Bar chart with gradient legend', { position: 'bottom', align: 'right', })
    .subtitle('Change of acceleration over the years colored with Horsepower', { position: 'bottom', align: 'right' })
    // .mount('#chart') // Render on a dom element

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

