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

<<<<<<< HEAD


    let rootData = new DataModel(jsonData, schema);


    const canvas = env.canvas()
        .data(rootData)
        .columns(['Acceleration'])
        .rows([ "Year"])
        .color("Origin")
        .height(200)
        .width(1600)
        .config({
            facet:{
                rows:{
                    verticalAlign: 'middle'
                }
            }
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
            }
        })
        .title("Year wise average car Acceleration")
        .layers([
=======
    // jsonData = [
    //     { Origin: "India", Year: "2018-02-22", Acceleration: 1000 },
    //     { Origin: "India", Year: "2018-03-12", Acceleration: 2000 },
    //     { Origin: "India", Year: "2018-04-01", Acceleration: 3000 },
    //     { Origin: "Japan", Year: "2018-02-22", Acceleration: 4000 },
    //     { Origin: "Japan", Year: "2018-03-12", Acceleration: 2000 },
    //     { Origin: "Japan", Year: "2018-04-01", Acceleration: 4000 },
    // ];
    shuffleArray(jsonData);
    let rootData = new DataModel(jsonData, schema);
    // rootData = rootData.groupBy(["Origin", "Year"], {
    //     Acceleration: "avg"
    // });

   window.canvas =  env.canvas()
   .rows(['Acceleration']) 
 .columns(['Year']) 
 .data(rootData)
 .width(550)
 .height(500)
   .title('Acceleration by Cylinders by Origin')
   .subtitle('For year 1970 - 1982')
   .layers([
            {
                mark: "area"
            },
            {
                mark: "bar"
            },
>>>>>>> d413deeadf6ca461c63b1c13663b597cf2f8dd58
            {
                mark: "bar"
            }
        ])
<<<<<<< HEAD
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
=======
        .color('Origin')
 .mount('#chart');
        // .data(rootData)
        // .rows(['Acceleration'])
        // .columns(["Year"])
        // .color("Origin")
        // .height(500)
        // .width(600)
        // .config({
        //     axes: {
        //         x: {
        //             tickFormat: (val, rawVal, i, ticks) => {
                   
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
        // .title("Year wise average car Acceleration")
        // .layers([
        //     {
        //         mark: "line"
        //     }
        // ])
        // .mount('#chart');

        // setTimeout(()=>{
        //     console.log('Updating...')
        //     canvas.rows(['Year'])
        //     .columns(['Origin'])
        // }, 1000)

        // setTimeout(()=>{
        //     console.log('Updating 2...')
        //     canvas.rows(['Year','Miles_per_Gallon'])
        //     .columns(['Origin'])
        //     .color('Cylinders')
        // }, 5000)

        // setTimeout(()=>{
        //     console.log('Updating 3...')
        //     canvas.rows(['Displacement','Miles_per_Gallon'])
        //     .columns(['Miles_per_Gallon','Displacement'])
        //     .color('Cylinders')
        //     .shape('Origin')
        // }, 8000)

        // setTimeout(()=>{
        //     console.log('Updating 4...')
        //     canvas.rows(['Displacement','Miles_per_Gallon'])
        //     .columns(['Year'])
        //     .color('Origin')
        //     .shape('Cylinders')
        //     .layers([
        //         {
        //             mark: "bar"
        //         }
        //     ])
        // }, 12000)
>>>>>>> d413deeadf6ca461c63b1c13663b597cf2f8dd58
});
