/* eslint-disable */

(function () {
    let env = muze();
    let DataModel = muze.DataModel;
    const SpawnableSideEffect = muze.SideEffects.SpawnableSideEffect;



    d3.json('../data/cars.json', (data) => {
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
                type: 'measure',
                defAggFn: 'avg'
            },
            {
                name: 'Weight_in_lbs',
                type: 'measure',
            },
            {
                name: 'Acceleration',
                type: 'measure',
                defAggFn: 'sum'
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
            },

            ];


        // Create an instance of DataModel using the data and schema.
        let rootData = new DataModel(data, schema);

        let layerFactory = muze.layerFactory

        layerFactory.composeLayers('compositeLine', [
            {
              name: 'verRefZone',
              mark: 'bar',
              source: 'verRefZoneData',
              className: 'verRefZone',
              encoding: {
                y: null,
                x: 'compositeLine.encoding.low',
                x0: 'compositeLine.encoding.high',
                color: {
                  value: () => 'rgba(255, 0, 0, 0.1)'
                }
              },
              axis: {
                x: 'Year'
              },
              calculateDomain: false
            }, {
              name: 'simpleLine',
              mark: 'line',
              encoding: {
                x: 'compositeLine.encoding.x',
                y: 'compositeLine.encoding.y',
      
              },
            },
          ])
      
      
        rootData = rootData.calculateVariable({
          name: 'highValue',
          type: 'dimension',
          subtype: 'temporal',
        }, ['Year', (d) => new Date(1982,0,1)]);
        rootData = rootData.calculateVariable({
          name: 'lowValue',
          type: 'dimension',
          subtype: 'temporal',
        }, ['Year', (d) => new Date(1979,0,1)]);
        rootData = rootData.groupBy(['Year', 'Origin', 'highValue', 'lowValue'], {
          Horsepower: 'mean',
          Acceleration: 'mean',
        });
        // Create an environment for future rendering
          let env = muze(); 
            // Create an instance of canvas which houses the visualization
          let canvas = env.canvas();
        
         
           canvas
                  .rows(['Acceleration'])
                  .columns(['Year'])
                  .data(rootData)
                  .width(600)
                  .height(400)
                  .transform({
                   'verRefZoneData': (dt) => dt.groupBy(['highValue', 'lowValue'])
                 })
                   .layers([{
                     mark: 'compositeLine',
                     encoding: {
                       x: 'Year',
                       high: 'highValue',
                       low: 'lowValue'
                     }
                   }
                           ])
                   .color('Origin')
                   .config({
                   axes: {
                     x: {
                       showAxisName: true,
                     }, y: {
                       showAxisName: true,
                     }
                   }
                 })
                 .title('The Muze Visualization')
                 .subtitle('Composable visualizations with a data first approach')
            .mount('#chart');
    })



}) ()