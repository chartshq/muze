/* eslint-disable*/
let env = muze();
const DataModel = muze.DataModel;
const  data = [{
    Acceleration: 2344,
    Year: 1970
}, {
    Acceleration: 2844,
    Year: 1971
},
{
    Acceleration: 2439,
    Year: 1972
},
{
    Acceleration: null,
    Year: 1973
},
{
    Acceleration: 2439,
    Year: 1974
}
];
const schema = [{
        name: 'Acceleration',
        type: 'measure'
    }, {
        name: 'Year',
        type: 'dimension'
    }];
    // Create an instance of DataModel using the data and schema.
    let rootData = new DataModel(data, schema);    
    
    // Get a canvas instance from Muze where the chart will be rendered.
    let canvas = env.canvas();

    canvas = canvas
    .rows(['Acceleration']) // Acceleration goes in X axis
    .columns(['Year'])
	.layers([{
        mark: 'line',
        connectNullData: true,
        nullDataLineStyle:{
            'stroke-dasharray' : ("8,4"),
            'stroke-width': 4,
            'stroke': 'pink'
        }
    }])
    .width(500)
    .height(500)
    .data(rootData)
    .title('Line Chart With Connected Null Data', { position: 'top', align: 'left' })
    .mount('#chart');