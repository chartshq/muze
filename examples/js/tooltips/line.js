/* eslint-disable */
const env1 = muze();
const DataModel1 = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    let jsonData1 = data;
    const schema1 = [{
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
        type: 'dimension'
    }
    ];
    let rootData1 = new DataModel1(jsonData1, schema1);

    env1.canvas().data(rootData1).width(600).height(400).rows(['Horsepower']).columns(['Origin'])
    .layer([{
        mark: 'point'
    }])
    .config({
        legend: {
            color: {
                item: {
                    text: { orientation: 'bottom' }
                }
            }
        }
    }).color('Origin').mount('#chart2').title('The car acceleration respective to origin', { position: 'bottom', align: 'left' });
});
