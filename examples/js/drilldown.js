/* global muze, d3 */

let env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const GenericBehaviour = muze.Behaviours.standards.GenericBehaviour;
const DataModel = muze.DataModel;
const ActionModel = muze.ActionModel;

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
        }
    ];
    const dataModel = new DataModel(jsonData, schema);

    const canvas = env.canvas()
        .data(dataModel)
        .rows(['Acceleration'])
        .columns(['Year'])
        .color('Origin')
        .width(800)
        .height(450)
        .mount('#chart');

    const nestedCanvasWidth = 300;
    const nestedCanvasHeight = 200;
    const nestedCanvas = env.canvas()
        .rows(['Acceleration'])
        .columns(['Maker'])
        .width(nestedCanvasWidth)
        .height(nestedCanvasHeight)
        .title('Maker vs. Acceleration')

    muze.ActionModel.for(canvas)
        .registerSideEffects(
            class CanvasPopUp extends SpawnableSideEffect {
                static formalName () {
                    return 'canvasPopup';
                }

                apply (selectionSet, payload) {
                    const model = selectionSet.mergedEnter.model;
                    const fieldsConf = model.getFieldsConfig();
                    const drawingContext = this.drawingContext();
                    const parentContainer = drawingContext.parentContainer;
                    const groupCont = this.createElement(parentContainer, 'div', [1], 'nestedCanvasContainer');
                    const layoutBoundBox = parentContainer.getBoundingClientRect();
                    const unitBoundBox = drawingContext.htmlContainer.getBoundingClientRect();

                    const offsetLeft = unitBoundBox.left - layoutBoundBox.left;
                    const originData = model.project(['Origin'], {
                        saveChild: false
                    }).getData().data.map(d => d[0]);

                    if (model.isEmpty()) {
                        groupCont.style('display', 'none');
                        return this;
                    }
                    const target = payload.target;
                    const context = this.firebolt.context;
                    const plotDimensions = context.getPlotPointsFromIdentifiers(target, {
                        getBBox: true
                    });
                    const makerData = dataModel.select(fields => {
                        return originData.indexOf(fields.Origin.value) !== -1;
                    }, {
                        saveChild: false
                    });
                    const plotDim = plotDimensions[0];
                    const topSpace = plotDim.y - unitBoundBox.top;
                    const leftSpace = plotDim.x - unitBoundBox.left;
                    const rightSpace = unitBoundBox.width - plotDim.x + plotDim.width;
                    const padding = 10;
                    const nestedCanvasTotalHeight = nestedCanvasHeight + padding * 2;
                    if (topSpace >= nestedCanvasTotalHeight) {
                        groupCont.style('left', `${plotDim.x + plotDim.width / 2 + offsetLeft -
                            nestedCanvasWidth}px`);
                        groupCont.style('top', `${plotDim.y - nestedCanvasTotalHeight}px`);
                    }
                    else {
                        groupCont.style('left', `${plotDim.x + plotDim.width + offsetLeft}px`);
                        groupCont.style('top', `${plotDim.y}px`);
                    }
                    groupCont.style('display', 'block');
                    const cnvsCont = this.createElement(groupCont, 'div', [1], 'nestedCanvas');
                    nestedCanvas.data(makerData);
                    nestedCanvas.mount(cnvsCont.node());
                }
            }
        )
        .mapSideEffects({
            select: ['canvasPopup']
        })
        .dissociateSideEffect(['tooltip', 'highlight'], ['tooltip', 'brush,select']);

    // ActionModel
    //                 .for(canvas)
    //                 .registerBehaviouralActions([class SingleSelectBehaviour extends GenericBehaviour {
    //                     static formalName () {
    //                         return 'singleSelect';
    //                     }
    //                     setSelectionSet (addSet, selectionSet) {
    //                         if (addSet === null || !addSet.length) {
    //                             selectionSet.reset();
    //                         } else {
    //                             const existingAddSet = selectionSet.getExistingEntrySet(addSet);
    //                             selectionSet.reset();
    //                             selectionSet.add(addSet);
    //                         }
    //                         console.log(addSet);
    //                         console.log(selectionSet);
    //                     }
    //   }])
    //                 .mapSideEffects({
    //                     singleSelect: [{
    //                         name: 'highlighter',
    //                         options: {
    //                             strategy: 'focus'
    //                         }
    //                     }
    //                     ]
    //                 })
    //                 .dissociateBehaviour(['select', 'click'])
    //                 // .dissociateSideEffect(['highlighter', 'highlight'])
    //                 .registerPhysicalBehaviouralMap({
    //                     click: { // name of the physical action
    //                         behaviours: ['singleSelect'] // names of behaviours
    //                     }
    //                 });
});