// /* eslint-disable */
let env = muze();
const DataModel = muze.DataModel;
window.dataSelect = muze.utils.dataSelect;
// d3.json('../../data/cars.json', (data) => {
//     const jsonData = data;
//     const schema = [{
//         name: 'Name',
//         type: 'dimension'
//     },
//     {
//         name: 'Maker',
//         type: 'dimension'
//     },
//     {
//         name: 'Miles_per_Gallon',
//         type: 'measure'
//     },

//     {
//         name: 'Displacement',
//         type: 'measure'
//     },
//     {
//         name: 'Horsepower',
//         type: 'measure'
//     },
//     {
//         name: 'Weight_in_lbs',
//         type: 'measure'
//     },
//     {
//         name: 'Acceleration',
//         type: 'measure'
//     },
//     {
//         name: 'Origin',
//         type: 'dimension'
//     },
//     {
//         name: 'Cylinders',
//         type: 'dimension'
//     },
//     {
//         name: 'Year',
//         type: 'dimension',
//         subtype: 'temporal',
//         format: '%Y-%m-%d'
//     }
//     ];

//     let rootData = new DataModel(jsonData, schema);
//     rootData = rootData.groupBy(["Origin", "Year"], {
//         Acceleration: "avg"
//     })

//     env.canvas()
//         .data(rootData)
//         .rows(['Acceleration'])
//         .columns(["Year"])
//         .color("Origin")
//         .height(500)
//         .width(600)
//         .title("Year wise average car Acceleration")
//         .mount('#chart');

// });

d3.json('../../data/cars.json', (data) => {
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
        // {dimType}
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
        }];
    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.calculateVariable({
        name: 'date',
        type: 'dimension',
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }, ['Year', function (d) {
        return d;
    }]);

    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
    const mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    let rows = [[ 'Horsepower'], ['Acceleration']],
        columns = ['Origin', 'Year'];
    canvas = canvas
    .rows(rows)
    .columns(columns)
    .height(800)
    .width(800)
    .color('Origin')
    // {rows}
    .mount(mountPoint);

    setTimeout(() => {
        canvas.config({
            axes: {
                y: {
                    nice: false
                }
            }
        })
        // .width(200).height(200);
    }, 2000);
});
