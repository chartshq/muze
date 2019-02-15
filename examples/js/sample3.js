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
        type: 'dimension'
        // subtype: 'temporal',
        // format: '%Y-%m-%d'
    }
    ];

 

    let rootData = new DataModel(jsonData, schema)
    .select(fields=>fields.Year.value === '1972-01-01');


   window.canvas =  env.canvas()
        .data(rootData)
        .columns(['Acceleration'])
        .rows([ 'Origin',"Year"])
        .color("Origin")
        .height(300)
        .width(300)
        .config({
            facet:{
                rows:{
                    verticalAlign: 'middle'
                }
            },
          
        })
        .config({
            axes: {
                x: {
                  
                    tickFormat: (val, rawVal, i, ticks) => {
                   
                        return val;
                    }
                },
                y: {
                    name: 'akasndklasndoiansflkjasdnfoslkdnf',
                    tickFormat: (val, rawVal) => {
                        // console.log(val, rawVal);
                        return val;
                    },
                }
            },
            pagination: 'holistic'
        })
        .title("Year wise average car Acceleration")
        .layers([
            {
                mark: "line"
            }
        ])
        .mount('#chart');
});

