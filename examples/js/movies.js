// /* global muze, d3 */

let env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;

d3.json('../data/movies.json', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'Title',
            type: 'dimension'
        },
        {
            name: 'US_Gross',
            type: 'measure'
        },
        {
            name: 'Worldwide_Gross',
            type: 'measure',
            defAggFn: 'avg'
        },

        {
            name: 'Production_Budget',
            type: 'measure'
        },
        {
            name: 'Distributor',
            type: 'dimension'
        },
        {
            name: 'Major_Genre',
            type: 'dimension'
        },
        {
            name: 'Cylinders',
            type: 'dimension'
        },
        {
            name: 'Year',
            type: 'dimension'
      // subtype: 'temporal',
      // format: '%Y-%m-%d'
        }
    ];
    let rootData = new DataModel(jsonData.slice(0, 25), schema);
    rootData = rootData.select(e => e.Major_Genre.value !== null && e.Major_Genre.value !== '');

    env = env
    .data(rootData)
    .minUnitHeight(10)
    .minUnitWidth(10);

    window.crosstab = env
    .canvas()
    .columns(['Major_Genre', 'Production_Budget'])
    .rows(['US_Gross'])
    .data(rootData)
    .minUnitWidth(10)
    // .title('Who let the dogs out when they came searching for the beast lurking')
    // .title('s')
    // .subtitle('Who let the dogs out when they came searching for the beast lurking Who let the dogs out when they came searching for the beast lurking')
    .color('Major_Genre')
    // .subtitle('asd')
    .width(1000)
    // .width(740)
    // .detail(['Major_'])
    .height(150)
    .config({
        border: {
            // color: '#f6f6f6'
        },
        facet: {
            row: {
                maxLines: 4,
                verticalAlign: 'middle'
            }
        },
        axes: {
            x: {
                // padding: 0
                showAxisName: false
                // tickValues: ['Slam']
                // tickFormat: (v) => v/1000
            }
        }

        // axes: { y: { tickValues: [0, 5000000] } }
    })

    .mount('#chart2');
});

// const env = muze();
// const DataModel = muze.DataModel;
// const chartData = [['Series', 'X', 'Y']];
// for (let i = 0; i < 500; i++) {
//     chartData[i + 1] = ['A', `${i + 1}`, Math.random()];
// }

// const res = chartData;

// const schema = [
//     {
//         name: 'X',
//         type: 'dimension',
//         format: '%s'
//     },
//     {
//         name: 'Series',
//         type: 'dimension',
//         format: '%s'
//     },
//     {
//         name: 'Y',
//         type: 'measure'
//     }
// ];
// const dm = new DataModel(res, schema);
// const canvas = env.canvas();
// canvas
//                 .data(dm)
//                 .height(450)
//                 .width(1850)
//                 .layers([{
//                     mark: 'line'
//                 }])
//                 .columns(['X'])
//                 .rows(['Y'])
//                 .color('Series')
//                 .config({
//                     axes: {
//                         x: {
//                             show: true,
//                             numberOfTicks: 10,
//                             axisNamePadding: 50,
//                             padding: 50,
//                             // tickValues: [50, 100, 150, 200, 250, 300, 350, 400, 450, 500]
//                             // tickFormat: (l) => {
//                             //     if (l % 50 === 0) {
//                             //         return l;
//                             //     } return '';
//                             // }

//                         },
//                         y: {
//                             show: false,
//                             showAxisName: false
//                         }
//                     }
//                 })
//                 .title('Test Chart', {
//                     align: 'center'
//                 })
//                 .mount('#chart');
