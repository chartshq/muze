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
            type: 'dimension',
            subtype: 'temporal',
            format: '%Y-%m-%d'
        }
    ];
    let rootData = new DataModel(jsonData, schema);

    // Create a new variable which will keep count of cars per cylinder for a particular origin
    rootData = rootData.calculateVariable(
        {
            name: 'CountVehicle',
            type: 'measure',
            defAggFn: 'count', // When ever aggregation happens, it counts the number of elements in the bin
            numberFormat: val => parseInt(val, 10)
        },
        ['Name', () => 1]
    );

    env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);

    // const crosstab = env.canvas()
    //     .rows(['Cylinders', 'Origin'])
    //     .columns(['Miles_per_Gallon'])
    //     .data(rootData)
    //     .width(600)
    //     .height(400)
    //     .mount('#chart');

    const lineChart = env.canvas()
        .rows(['CountVehicle'])
        .columns(['Year'])
        .data(rootData)
        .width(400)
        .height(400)
        .layers([{
            mark: 'line'
        }])
        .title('This is title')
        .subtitle('this is subtitle')
        .color('Origin')
        .shape('Cylinders')
        .size('CountVehicle')
        .mount('#chart2');

    // const barChart = env.canvas()
    //     .rows(['Miles_per_Gallon'])
    //     .columns(['Maker'])
    //     .data(rootData.groupBy(['Maker']).sort([['Miles_per_Gallon', 'ASC']]))
    //     .width(600)
    //     .height(400)
    //     .config({
    //         autoGroupBy: {
    //             disabled: true
    //         }
    //     })
    //     .color('Miles_per_Gallon')
    //     .mount('#chart3');

    // const pieChart = env.canvas()
    //     .rows([])
    //     .columns([])
    //     .data(rootData)
    //     .width(600)
    //     .height(400)
    //     .layers([{
    //         mark: 'arc',
    //         encoding: {
    //             angle: 'CountVehicle'
    //         }
    //     }])
    //     .color('Origin')
    //     .mount('#chart4');

    // muze.ActionModel.for(crosstab, lineChart, pieChart).enableCrossInteractivity({
    //     behaviours: {
    //         // Disable all behaviours if any propagation is initiated from pie chart.
    //         '*': (propagationPayload, context) => {
    //             const sourcePropagationCanvas = propagationPayload.sourceCanvas;
    //             const sourceCanvas = context.parentAlias();
    //             if (sourcePropagationCanvas) {
    //                 return sourceCanvas !== sourcePropagationCanvas ?
    //                     [pieChart.alias(), lineChart.alias()].indexOf(sourcePropagationCanvas) === -1
    //                     : true;
    //             }
    //             return true;
    //         }
    //     },
    //     sideEffects: {
    //         // Disable tooltip on propagation
    //         tooltip: () => false
    //     }
    // })
    //                 .for(lineChart).registerSideEffects(
    //         class NewSideEffect extends SpawnableSideEffect {
    //             constructor (...params) {
    //                 super(...params);
    //                 this._layers = this.firebolt.context.addLayer({
    //                     name: 'lineLayer',
    //                     mark: 'line',
    //                     className: 'linelayer',
    //                     encoding: {
    //                         x: 'Year',
    //                         y: 'Miles_per_Gallon',
    //                         color: {
    //                             value: () => '#8e0707'
    //                         }
    //                     },
    //                     render: false
    //                 });
    //             }

    //             static formalName () {
    //                 return 'lineLayer';
    //             }

    //             apply (selectionSet) {
    //                 const sideEffectGroup = this.drawingContext().sideEffectGroup;
    //                 const layerGroups = this.createElement(sideEffectGroup, 'g', this._layers, '.extra-layers');
    //                 layerGroups.each(function (layer) {
    //                     layer.mount(this).data(selectionSet.mergedEnter.model);
    //                 });
    //             }
    //         }
    //     )
    //                 .mapSideEffects({
    //                     select: [{
    //                         name: 'lineLayer',
    //                         applyOnSource: false
    //                     }]
    //                 })
    //                 .for(pieChart)
    //                 .mapSideEffects({
    //                     select: [{
    //                         name: 'filter',
    //                         applyOnSource: false // Filter should not apply on the same canvas where action happened
    //                     }]
    //                 });
});
