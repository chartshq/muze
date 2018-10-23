/* global muze, d3 */

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
    .rows(['Title'])
    .columns(['US_Gross'])
    .data(rootData)
    .minUnitWidth(10)
    .title('Who let the dogs out when they came searching for the beast lurking')
    // .title('s')
    .subtitle('Who let the dogs out when they came searching for the beast lurking Who let the dogs out when they came searching for the beast lurking')
    .color('Major_Genre')
    // .subtitle('asd')
    .width(700)
    // .detail(['Major_'])
    .height(500)
    .config({
        border: {
            // color: '#f6f6f6'
        },
        facet: {
            columns: {
                maxLines: 2
                // verticalAlign: 'top'
            }
        },
        axes: {
            x: {
                // tickValues: ['Slam']
            }
        },
        legend: {
            position: 'left'
        }

        // axes: { y: { tickValues: [0, 5000000] } }
    })

    .mount('#chart2');
});
