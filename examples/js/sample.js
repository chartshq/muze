(function () {
    let env = muze();
    let DataModel = muze.DataModel,
        share = muze.operators.share,
        html = muze.operators.html,
        actionModel = muze.ActionModel,
        utils = muze.utils;
    const SpawnableSideEffect = muze.SideEffects.abstract.SpawnableSideEffect;

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
                type: 'dimension'
                // subtype: 'temporal',
                // format: '%Y-%m-%d'
            }

            ];
        let rootData = new DataModel(jsonData, schema);

        // rootData = rootData.groupBy(['Year', 'Maker'], {
        // 	Horsepower: 'mean',
        // 	Displacement: 'mean'
        // });
        rootData = rootData.calculateVariable(
            {
                name: 'Actual_Displacement',
                type: 'measure'
            }, ['Displacement', (ac) => {
                if (ac < 500) {
                    return -ac;
                } return ac;
            }]
        );
        rootData = rootData.calculateVariable({
            name: 'negativeValues',
            type: 'dimension'
        }, ['Actual_Displacement', (y) => {
            if (y < 0) {
                return 'Less than Zero';
            } return 'Greater than Zero';
        }]);
        //    rootData = rootData.groupBy(['Year', 'negativeValues'])

        env = env.data(rootData).minUnitHeight(40).minUnitWidth(40);
        const mountPoint = document.getElementById('chart');
        window.canvas = env.canvas();
        let canvas2 = env.canvas();
        const canvas3 = env.canvas();
        let rows = ['Acceleration'],
            columns = ['Cylinders'];
        canvas2 = canvas2
            .rows(rows)
            .columns(['Origin'])
            .color({
                field: 'Acceleration',
                step: true
            })
            .data(rootData)
            .width(600)
            .height(350)
            .config({
            //     //         border:{
            //     //             width: 2,
                legend: {
                    position: 'right'
                }
            })

            //             axes:{
            //                     x:{
            //                         showAxisName: true,

            //                 }, y:{
            //                     showAxisName: true,
            //                     // name: 'Acceleration per year',
            //                     // axisNamePadding: 12
            //                 }
            //             },
            //     //         legend: {
            //     //             color:{
            //     //             // show: false
            //     //             }
            //     //         }
            //         })
            .mount(document.getElementById('chart'));
        canvas = canvas
            .rows(rows)
            .columns(columns)
            // .color({field: 'Acceleration', step: true})
            .color({
                value: 'RED'
            })
            .data(rootData)
            .width(600)
            .height(550)

            //     // .size()
            //     .layers([{
            //         mark: 'point',
            //         encoding: {
            //             y: 'Horsepower'
            //         }

            //     }])
            //     // .size('Origin')
            .config({
                //         border:{
                //             width: 2,
                //   legend:{
                //     //   position: 'bottom'
                //   },

                axes: {
                    x: {
                        showAxisName: true

                    },
                    y: {
                        showAxisName: true
                        // name: 'Acceleration per year',
                        // axisNamePadding: 12
                    }
                }
                //         legend: {
                //             color:{
                //             // show: false
                //             }
                //         }
            })

            .title('The Muze Project', { position: 'top', align: 'left' })
            .subtitle('Composable visualisations with a data first approach', { position: 'top', align: 'left' })
            .mount(document.getElementById('chart2'));

        muze.ActionModel
                        .for(canvas, canvas2)
                        .registerPhysicalActions({
                            ctrlClick: firebolt => (targetEl, behaviours) => {
                                targetEl.on('d.click', function (args) {
                                    if (event.metaKey) {
                                        const event = utils.getEvent();
                                        const mousePos = utils.getClientPoint(this, event);
                                        const nearestPoint = firebolt.context.getNearestPoint(mousePos.x, mousePos.y, {
                                            data: args
                                        });
                                        behaviours.forEach(behaviour => firebolt.dispatchBehaviour(behaviour, {
                                            criteria: nearestPoint.id
                                        }));
                                    }
                                });
                            }
                        }).registerPhysicalBehaviouralMap({
                            ctrlClick: {
                                behaviours: ['select']
                            }
                        })
                        .registerSideEffects(class TextSideEffect extends SpawnableSideEffect {
                            static formalName () {
                                return 'selection-text';
                            }

                            apply (selectionSet) {
                                const dataModel = selectionSet.mergedEnter.model;
                                const drawingInf = this.drawingContext();
                                const sideEffectGroup = drawingInf.sideEffectGroup;

                                const textGroups = this.createElement(drawingInf.htmlContainer, 'div', [1], 'selected');
                                textGroups.html(`Selected:${dataModel.getData().data.map(e => e.join(', '))}`);
                                textGroups.style('position', 'absolute');
                                return this;
                            }
            }).registerSideEffects(class StrokeSideEffect extends SpawnableSideEffect {
                static formalName () {
                    return 'stroke-effect';
                }

                apply (selectionSet) {
                    const { completeSet, mergedExit, mergedEnter } = selectionSet;
                    const context = this.firebolt.context;
                    const layers = context.layers();
                    layers.forEach((e) => {
                        const enterElements = e.getPlotElementsFromSet(mergedEnter.uids);
                        enterElements.style('stroke', 'red');
                        const exitElements = e.getPlotElementsFromSet(mergedExit.uids);
                        exitElements.style('stroke', '');
                    });
                }
            }).mapSideEffects({
                select: ['selection-text', 'stroke-effect']

            });
    });
}());
