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
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }
    ];
    jsonData = [
        {
            Origin: 'USA',
            Cylinders: 5,
            Name: 'x',
            Horsepower: 12
        },


        {
            Origin: 'Japan',
            Cylinders: 3,
            Name: 'z',
            Horsepower: 12
        },
        {
            Origin: 'Japan',
            Cylinders: 3,
            Name: 'k',
            Horsepower: 12
        },
        {
            Origin: 'Japan',
            Cylinders: 5,
            Name: 'x',
            Horsepower: 12
        },
        {
            Origin: 'Europe',
            Cylinders: 3,
            Name: 'x',
            Horsepower: 12
        },
        {
            Origin: 'Europe',
            Cylinders: 3,
            Name: 'r',
            Horsepower: 12
        },
        {
            Origin: 'Europe',
            Cylinders: 5,
            Name: 'x',
            Horsepower: 12
        },
    ]

    let rootData = new DataModel(jsonData, schema)
    console.log(rootData.sort([
        ['Cylinders', null],
        ['Origin', 'desc'],
        ['Name', 'asc']
    ]).getData().data);


        const canvas = env.canvas();
        canvas
        .data(rootData)
        .width(850)
        .height(550)
        .rows(["Cylinders", "Origin", "Name"])
        .columns(["Horsepower"])
        .mount("#chart")
        .config({
            showHeaders: true,
            sort: {
                Origin: "asc",
                Name: "asc"
            }
        })
});
