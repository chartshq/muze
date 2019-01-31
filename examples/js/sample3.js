/* eslint disable */
let env = muze();
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

    let rootData = new DataModel(jsonData, schema);

    rootData = rootData.groupBy(['Year'], {
        Horsepower: 'mean',
        Acceleration: 'mean',
        Weight_in_lbs: 'mean'
    });

    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
    const mountPoint = document.getElementById('chart');
    window.canvas = env.canvas();
    let rows = ['Acceleration', 'Horsepower', 'Weight_in_lbs'],
        columns = ['Year'];
    canvas = canvas.rows(rows).columns(columns).data(rootData).width(300).height(700).config({
        border: {
            style: 'solid',
            color: 'black',
            width: 2
        }
    }).mount(mountPoint).onAnimationEnd((client) => {
        const element = document.getElementById('chart');
        element.classList.add('animateon');
    });
});

