/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;

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
        type: 'measure',
        numberFormat: (val) => "$" + val ,
        displayName: "Acceleration2"
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
        format: '%Y-%m-%d',
        displayName: "Year2"
    }
    ];


    let rootData = new DataModel(jsonData, schema);
    // rootData = rootData.groupBy(["Name", "Origin", "Year"], {
    //     Acceleration: "avg"
    // });

    const canvas = env.canvas()
        .data(rootData)
        .rows(["Acceleration"])
        .columns(["Year", "Name", "Origin"])
        .height(500)
        .width(1500)
        // .config({
        //     axes: {
        //         x: {
        //             tickFormat: (val, rawVal, i, ticks) => {
        //                 console.log(val, rawVal, ticks);
        //                 return val;
        //             }
        //         },
        //         y: {
        //             tickFormat: (val, rawVal) => {
        //                 // console.log(val, rawVal);
        //                 return val;
        //             },
        //         }
        //     }
        // })
        .title("Year wise average car Acceleration")
        .layers([
            {
                mark: "bar"
            }
        ])
        .mount('#chart');

        setTimeout(()=>{
            console.log('Updating...')
            canvas.rows(['Year'])
            .columns(['Origin'])
        }, 1000)

        setTimeout(()=>{
            console.log('Updating 2...')
            canvas.rows(['Year','Miles_per_Gallon'])
            .columns(['Origin'])
            .color('Cylinders')
        }, 5000)

        setTimeout(()=>{
            console.log('Updating 3...')
            canvas.rows(['Displacement','Miles_per_Gallon'])
            .columns(['Miles_per_Gallon','Displacement'])
            .color('Cylinders')
            .shape('Origin')
        }, 8000)

        setTimeout(()=>{
            console.log('Updating 4...')
            canvas.rows(['Displacement','Miles_per_Gallon'])
            .columns(['Year'])
            .color('Origin')
            .shape('Cylinders')
            .layers([
                {
                    mark: "bar"
                }
            ])
        }, 12000)
});
