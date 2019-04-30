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

    let rootData = new DataModel(jsonData, schema)

    rootData.sort([
        ['Cylinders', 'asc'],
        ['Maker', 'desc'],
    ])
  
    // .select(fields=>fields.Year.value === '1972-01-01');

    var rows = ['Origin','Acceleration'],
            columns = rows.reverse();
        const canvas = env.canvas()
        .columns(['Cylinders'])
        .rows([  'Origin']).data(rootData).height(300).width(300)
        .detail(['Name', 'Cylinders'])
        .title('The car acceleration respective to origin', { position: 'bottom', align: 'center' }).color({
            field: 'Acceleration'
        }).mount('#chart')
});
