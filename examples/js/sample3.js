/* eslint-disable */
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
        subtype: 'temporal',
        format: '%Y-%m-%d'
    }
    ];
    let DataModel = muze.DataModel;
    let rootData = new DataModel(data, schema);
    let env = muze(); 
    let canvas = env.canvas();

    canvas
        .rows(['Origin', 'Acceleration']) 
        .columns(['Cylinders']) 
        .data(rootData)
        .width(550)
        .height(500)
        .title('Acceleration by Cylinders by Origin')
        .subtitle('For year 1970 - 1982')
        .mount('#chart');
        
      setTimeout(() => {
        const filtered = rootData.select((tuples) => {
          return tuples.Origin.value === 'DoesNotExist';
      });
      const filteredObj = filtered.getData();
      // the are no rows selected
      //if (!filteredObj.data.length) {
      console.log(filtered)
          canvas.title("nothing should be rendering").data(filtered)
            //	}
    
    }, 4000);  
});
