/* eslint-disable */


d3.json('../../data/cars-with-null.json', (data) => {
    let jsonData = data;
    const schema = [{
        name: 'Acceleration',
        type: 'measure'
    },
    {
        name: 'Origin',
        type: 'dimension'
    },
    {
        name: 'Year',
        type: 'dimension'
    }
    ];
    const env = muze();
    const DataModel = muze.DataModel;
    let rootData = new DataModel(jsonData, schema);
    const filtered = rootData.select((tuples) => {
        return tuples.Origin.value === 'USA';
    });

    env.canvas()      
        .rows(['Acceleration']) // Acceleration goes in Y-Axis
        .columns(['Year']) // Horsepower goes in Y-Axis
        .data(rootData)
        .layers([{
        mark : 'area',
        connectNullData: false
        }])
        .color('Origin')
        .width(850)
        .height(650)
        .title('Area')
        .mount("#chart1");
        
    env.canvas()      
        .rows(['Acceleration']) // Acceleration goes in Y-Axis
        .columns(['Year']) // Horsepower goes in Y-Axis
        .data(rootData)
        .layers([{
        mark : 'area',
        connectNullData: true
        }])
        .color('Origin')
        .width(850)
        .height(650)
        .title('Area')
        .mount("#chart1");
    
    env.canvas()      
        .rows(['Acceleration']) // Acceleration goes in Y-Axis
        .columns(['Year']) // Horsepower goes in Y-Axis
        .data(filtered)
        .layers([{
            mark : 'area',
            connectNullData: false
        }])
        .color('Origin')
        .width(850)
        .height(650)
        .title('Area')
        .mount("#chart1");
    env.canvas()      
        .rows(['Acceleration']) // Acceleration goes in Y-Axis
        .columns(['Year']) // Horsepower goes in Y-Axis
        .data(filtered)
        .layers([{
            mark : 'area',
            connectNullData: true
        }])
        .color('Origin')
        .width(850)
        .height(650)
        .title('Area')
        .mount("#chart1");
});

