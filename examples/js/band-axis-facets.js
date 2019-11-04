/* eslint-disable */
// const env = muze();
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
    }];

    window.rootData = new DataModel(jsonData, schema)

    rootData = rootData.calculateVariable({
        name: "date",
        type: "dimension",
        subtype: "temporal",
        format: "%Y-%m-%d"
    }, ["Year", function (d) {
        return d;
    }]);

    const env = muze().data(rootData).minUnitHeight(40).minUnitWidth(40);
    var mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    var rows = ['Cylinders', 'Horsepower'],
        columns = ['Origin', 'Year'];
    canvas = canvas.rows(rows).columns(columns).height(800).color('Origin')
    .mount(mountPoint);

    setTimeout(() => {
        canvas.rows(['Horsepower', 'Acceleration']).columns(['Acceleration', 'Horsepower']).color('Horsepower').size('Cylinders').detail(['Maker']).width(300).height(300);
        canvas.once('canvas.animationend').then(function (client) {
            var element = document.getElementById('chart');
            element.classList.add('animateon');
        });
    }, 3000);
});