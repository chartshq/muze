/* eslint disable */
let env = muze();
const DataModel = muze.DataModel;

d3.json('../../data/cars.json', (data) => {
    const jsonData = data,
        schema = [{
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

    const rootData = new DataModel(jsonData, schema);
    window.rootData = rootData;
    env = env.data(rootData).minUnitHeight(100).minUnitWidth(20);
    const mountPoint = document.getElementsByClassName('chart')[0];
    const canvas = env.canvas();
    window.canvas = canvas;
    let rows = ['Acceleration'],
        columns = ['Displacement'];
    canvas;
        // .rows(rows)
        // .columns(columns)
        // .width(600)
        // .height(400)
        // .data(rootData)
        // .color('Origin')
        // .detail(['Name'])
        // // .title('Hellooo')
        // // .subtitle('Hello')
        // .config({
        //     legend: {
        //         position: 'bottom'
        //     }
        // })
        // .mount(document.getElementById('chart'));

    canvas
  		.rows(['Maker']) // CountVehicle goes in y axis
          .columns([['Year']]) // Cylinders goes in x-axis
          .color({
              field: 'Acceleration',
              stops: 7
          })
        // .color('Origin')

                    .data(rootData)
//   		.layers({ // Draw a bar plot, by default stack transform is used
//         	Acceleration: {
//             	mark: 'bar'
//         }
//   })
                    .config({
                        legend: {
                            position: 'bottom'
                        }
                    })
      	.width(700)
      	.height(500)
  		.title('Stacked bar chart', { position: 'top', align: 'right' })
  		// .subtitle('Count of cars per cylinder per origin', { position: 'top', align: 'right' })
      	.mount('#chart');
});
