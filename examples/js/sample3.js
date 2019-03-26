/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

function shuffleArray(array) {
    for (var i = array.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}


d3.json('../../data/cars.json', (data) => {
    let jsonData = data;
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
        type: 'measure'
    },
    {
        name: 'Acceleration',
        type: 'measure',
        numberFormat: (val) => "$" + val
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

    // function shuffleArray(array) {
    //     for (var i = array.length - 1; i > 0; i--) {
    //         var j = Math.floor(Math.random() * (i + 1));
    //         var temp = array[i];
    //         array[i] = array[j];
    //         array[j] = temp;
    //     }
    // }
    // shuffleArray(jsonData)
    let rootData = new DataModel(jsonData, schema)
    // .select(fields=>fields.Year.value === '1972-01-01');


   window.canvas =  env.canvas()
        .data(rootData)
        .rows([])
        .columns([])
        .layers([{
            mark: 'arc',
            encoding: {
                radius: {
                    // field: 'Horsepower'
                }
            },
            sort: 'asc'

        }]).data(rootData).color({
            field: 'Horsepower',
            interpolate: false,
            steps: 4
        }).width(600).height(500).config({
            legend: {
                position: 'bottom'
            }
        })
        // .config({
        //     axes: {
        //         x: {

    var rows = [],
    columns = [];
canvas = canvas.rows(columns).columns(rows).layers([{
    mark: 'arc',
    encoding: {
        radius: {
            field: 'Displacement'
        }
    },
    // sort: 'asc'

}]).data(rootData).color({
    field: 'Horsepower',
    interpolate: true
}).width(600).height(500).legend({
    'position': 'right'
}).mount('#chart').once('canvas.animationend').then(function (client) {
    var element = document.getElementById('chart');
    element.classList.add('animateon');
});

    // invert configuration after 3s
    //    setTimeout(() => {
    //     canvas.rows(['Horsepower']).columns(['Origin', 'Year']);
    //   // invert inverted confog after 3s
    //   setTimeout(() => {
    //   canvas.rows(['Origin','Year']).columns(['Horsepower']);
    //   }, 3000)
    // }, 3000)

//  window.canvas =  env.canvas()
//         .data(rootData)
//         .rows([])
//         .columns(['Year'])
//         .color('Origin')
//         // .color("Origin")
//         .height(600)
//         .width(500)
//         .config({
//             facet:{
//                 rows:{
//                     verticalAlign: 'middle'
//                 }
//             },

//         })
//         .title("Year wise average car Acceleration")
//         .layers([
//             {
//                 mark: "area"
//             },
//             {
//                 mark: 'text',
//                 encoding: {
//                     text: 'Acceleration'
//                 },
//                 transform: {
//                     type: 'stack',
//                     groupBy: 'Origin'
//                 }
//             }
//         ])
//  .mount('#chart2');
});
