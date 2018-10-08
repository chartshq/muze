/* global muze, d3 */

let env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;

d3.json('../data/cars.json', (data) => {
    const jsonData = data;
    const schema = [
        {
            name: 'Name',
            type: 'dimension'
        },
        {
            name: 'Maker',
            type: 'dimension'
        },
        {
            name: 'Miles_per_Gallon',
            type: 'measure',
            defAggFn: 'avg'
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
            type: 'measure'
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
            type: 'dimension'
            // subtype: 'temporal',
            // format: '%Y-%m-%d'
        }
    ];
    const dataModel = new DataModel(jsonData, schema);

  // Create a new variable which will keep count of cars per cylinder for a particular origin
    const rootData = dataModel.calculateVariable(
        {
            name: 'CountVehicle',
            type: 'measure',
            defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
            numberFormat: val => parseInt(val, 10)
        },
    ['Name', () => 1]
  );
    // rootData = rootData.select(e => e.Cylinders.value === '4');

    env = env
    .data(rootData)
    .minUnitHeight(10)
    .minUnitWidth(10);

    window.canvas = env
    .canvas()
    .rows([['Origin', 'Cylinders'], ['Acceleration']])
    .columns(['Year', 'Acceleration'])
    .data(rootData)
    // .color('Acceleration')
    .width(1400)
    .height(500)
    .config({
        border: {
            color: '#f6f6f6'
        },
        axes: {
            y: {
                showInnerTicks: true
            }
        }
    })

    .mount('#chart2');

    // const lineChart = env
    // .canvas()
    // .rows([['Miles_per_Gallon'], ['Acceleration', 'Horsepower', 'Horsepower']])
    // .columns(['Year'])
    // .data(rootData)
    // .width(450)
    // .height(700)
    // .color({
    //     field: 'Acceleration',
    //     step: true,
    //     stops: 5
    // })
    // .config({
    //     axes: {
    //         y: {
    //             domain: [10, 50]
    //         }
    //     },
    //     border: {
    //         color: '#f6f6f6'
    //     },
    //     interaction: {
    //         tooltip: {
    //             formatter: (dm) => {
    //                 const valueMatrix = lineChart
    //           .composition()
    //           .visualGroup.composition()
    //           .matrices.value.matrix();
    //                 const selectedLineLayer = valueMatrix[0][0]
    //           .valueOf()
    //           .getLayerByName('lineLayer');
    //                 const selectedLineLayerData = selectedLineLayer.data();
    //                 const fullData = dm.getData().data;
    //                 const fieldsConf = dm.getFieldsConfig();
    //                 const yearIndex = fieldsConf.Year.index;
    //                 let selectedData;

    //                 if (selectedLineLayerData) {
    //                     selectedData = selectedLineLayerData.select(
    //             fields =>
    //               fullData.findIndex(
    //                 d => d[yearIndex] === fields.Year.value
    //               ) !== -1,
    //                         {
    //                             saveChild: false
    //                         }
    //           );
    //                 }
    //                 const { DateTimeFormatter } = muze.utils;
    //                 const tooltipData = [
    //                     [
    //                         {
    //                             value: 'Year',
    //                             className: 'muze-tooltip-key'
    //                         },
    //                         {
    //                             value: DateTimeFormatter.formatAs(
    //                 fullData[0][yearIndex],
    //                 '%Y'
    //               ),
    //                             className: 'muze-tooltip-value'
    //                         }
    //                     ],
    //                     [
    //                         {
    //                             value: 'Miles_per_Gallon',
    //                             className: 'muze-tooltip-key'
    //                         },
    //                         {
    //                             value: fullData[0][fieldsConf.Miles_per_Gallon.index].toFixed(2),
    //                             className: 'muze-tooltip-value'
    //                         }
    //                     ]
    //                 ];

    //                 if (selectedData && !selectedData.isEmpty()) {
    //                     const mpgData = selectedData.getData().data;
    //                     const mpgIndex = selectedData.getFieldsConfig().Miles_per_Gallon
    //             .index;
    //                     tooltipData.push([
    //                         {
    //                             value: 'Selected_Miles_per_Gallon',
    //                             className: 'muze-tooltip-key'
    //                         },
    //                         {
    //                             value: mpgData[0][mpgIndex].toFixed(2),
    //                             className: 'muze-tooltip-value'
    //                         }
    //                     ]);
    //                 }
    //                 return tooltipData;
    //             }
    //         }
    //     },
    //     legend: {
    //         color: {
    //             position: 'bottom'
    //         }
    //     }
    // })
    // .title('Change of Avg Mileage of Cars over 12 Years', {
    //     align: 'center'
    // })
    // .layers([
    //     {
    //         mark: 'line',
    //         encoding: {
    //             color: {
    //                 value: () => '#9e9e9e'
    //             }
    //         }
    //     }
    // ])
    // .mount('#chart');

    // const pieChart = env
    // .canvas()
    // .rows(['Origin'])
    // .columns(['Acceleration'])
    // .data(rootData)
    // .width(600)
    // .height(600)
    // // .layers([
    // //     {
    // //         mark: 'arc',
    // //         encoding: {
    // //             angle: 'CountVehicle'
    // //         }
    // //     }
    // // ])
    // .config({ legend: {
    //     position: 'bottom',
    //     color: {
    //         title: {
    //             // text: 'Country of Origin of Cars'
    //         }
    //     }
    // } })
    // .color('Origin')
    // .shape('Origin')
    // .title('Count of Cars by Country', {
    //     align: 'center'
    // })
    // .mount('#chart4');

    // muze.ActionModel.for(crosstab, lineChart, pieChart)
    //                 .enableCrossInteractivity({
    //                     behaviours: {
    //     // Disable all behaviours if any propagation is initiated from pie chart.
    //                         '*': (propagationPayload, context) => {
    //                             const sourcePropagationCanvas = propagationPayload.sourceCanvas;
    //                             const sourceCanvas = context.parentAlias();
    //                             if (sourcePropagationCanvas) {
    //                                 return sourceCanvas !== sourcePropagationCanvas
    //           ? [lineChart.alias()].indexOf(sourcePropagationCanvas) === -1
    //           : true;
    //                             }
    //                             return true;
    //                         }
    //                     },
    //                     sideEffects: {
    //     // Disable tooltip on propagation
    //                         tooltip: () => false
    //                     }
    //                 })
    //                 .for(crosstab, pieChart)
    //                 .registerPropagationBehaviourMap({
    //                     select: 'filter'
    //                 })

    //                 .for(lineChart)
    //                 .registerSideEffects(
    //   class NewSideEffect extends SpawnableSideEffect {
    //       constructor (...params) {
    //           super(...params);
    //           this._layers = this.firebolt.context.addLayer({
    //               name: 'lineLayer',
    //               mark: 'line',
    //               className: 'linelayer',
    //               encoding: {
    //                   x: 'Year',
    //                   y: 'Miles_per_Gallon',
    //                   color: {
    //                       value: () => '#414141'
    //                   }
    //               },
    //               render: false
    //           });
    //       }

    //       static formalName () {
    //           return 'lineLayer';
    //       }

    //       apply (selectionSet) {
    //           const { sideEffectGroup } = this.drawingContext();
    //           const layerGroups = this.createElement(
    //         sideEffectGroup,
    //         'g',
    //         this._layers,
    //         '.extra-layers'
    //       );
    //           layerGroups.each(function (layer) {
    //               layer.mount(this).data(selectionSet.mergedEnter.model);
    //           });
    //       }
    //   }
    // )
    //                 .mapSideEffects({
    //                     filter: {
    //                         effects: ['lineLayer'],
    //                         preventDefaultActions: true
    //                     }
    //                 });
});
