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
        numberFormat: (val) => "$" + val 
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

    jsonData = [
        { Origin: "India", Year: "2018-02-22", Acceleration: 1000, Name: "A" },
        { Origin: "India", Year: "2018-03-12", Acceleration: 2000, Name: "B" },
        { Origin: "India", Year: "2018-04-01", Acceleration: 3000, Name: "C" },
        { Origin: "Japan", Year: "2018-02-22", Acceleration: 4000, Name: "D" },
        { Origin: "Japan", Year: "2018-03-12", Acceleration: 2000, Name: "A" },
        { Origin: "Japan", Year: "2018-04-01", Acceleration: 4000, Name: "D" },
    ];

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.groupBy(["Name", "Origin", "Year"], {
        Acceleration: "avg"
    });

    env.canvas()
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
});

