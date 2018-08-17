
/* eslint-disable */
/* eslint-disable */
(function () {
    // one type of renderer setup
    const p = muze.Muze();
        // picassoInstance2 = muze.Muze();
    var dm = muze.DataModel;

    var fn = p.width(1000);


    d3.json('../../data/cars.json', (data) => {
        const jsonData = data,
            schema = [
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
                    type: 'measure'
                },
                {
                    name: 'Weight_in_lbs',
                    type: 'measure',
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
                },

            ];
        let rootData = new dm(jsonData, schema);
        window.rootData = rootData;
        // // some data operation
        rootData1=rootData.groupBy(['Year'], {
            Horsepower : 'sum',
            Miles_per_Gallon : 'mean',
            Displacement : 'mean',
            Acceleration: 'mean',
        });

        // create renderer from combinaton of global and local settings
        let viz = fn.instance()
            .height(400)
            .data(rootData1);
        // let viz = renderer.instance();
        rootData2= rootData.groupBy(['Origin', 'Year'], {
            Horsepower : 'mean',
            Miles_per_Gallon : 'mean',
            Displacement : 'mean',
            Acceleration: 'mean',
        });;

        let viz2 = fn.instance()
        .height(300)
        .data(rootData2);

        // let viz2 = renderer2.instance();
         function render() {
            viz = viz  /* takes the rest of the config from global */
                .rows(['Acceleration'])
                .columns(['Year'])
                .mount(d3.select('body').append('div').node());
                window.viz = viz;

                // viz2 = viz2  /* takes the rest of the config from global */
                // .rows(['Horsepower'])
                // .columns(['Year'])
                // .mount(d3.select('body').append('div').node());

                // setTimeout(() => {
                //     // @todo
                //     // viz.getVisualUnit(i , j)
                //     // viz.getVisualUnit(fieldName)
                //     // viz.getVisualUnit() // return the first one
                //     // viz.getValueMatrix()
                //     // viz.getGroupAxes()
                //     let dataModels = {
                //         selection: null,
                //         calcMeasure: null
                //     };
                //     let behaviourCallback = function (selectionSet, payload, dm, propagationTable) {
                //         let criteria = payload.criteria;
                //         // let dataModel = this.getDataModelFromRange(dm, {
                //         //     Year: criteria.Year
                //         // },
                //         //     dataModels.selection);
                //         // let calcTable;
                //         // if (dataModels.calcMeasure) {
                //         //     calcTable = dataModels.calcMeasure;
                //         // }
                //         // else {
                //         //     calcTable = dataModel.groupBy([''], {
                //         //         Horsepower: 'mean'
                //         //     });
                //         // }
                //         // dataModels.calcMeasure = calcTable;
                //         // dataModels.selection = dataModel;
                //         let exitSet = selectionSet.exitSet,
                //             entrySet = selectionSet.entrySet,
                //             completeSet = selectionSet.completeSet;
                //         if (!exitSet.length && !entrySet.length) {
                //             this.operations.unfade(completeSet);
                //         }
                //         else {
                //             this.operations.fade(exitSet);
                //             this.operations.unfade(entrySet);
                //         }
                //         // this.vuInstance.axes().x[0].updateDomain(criteria.Year);
                //         // this.vuInstance.layerManager.getLayer('line').dataModel(dataModel);

                //     };
                //     let centerMatrix = viz.compositon.VisualGroup._layout._centerMatrix;
                //     var unit = centerMatrix[0][0].unit;
                //     centerMatrix.forEach((rowMatrix) => {
                //         rowMatrix.forEach((cell) => {
                //             // cell.unit.fireBolt &&
                //                 // cell.unit.fireBolt.propagateWith(['Year']);
                //                 cell.unit.fireBolt.onBehaviourDispatch('select',
                //                     behaviourCallback);
                //                 // window.dataModel = cell.unit.dataModel();
                //                 // cell.unit.layerManager.addLayer({
                //                 //     mark: 'point',
                //                 //     name: 'newlayer',
                //                 //     encoding: {
                //                 //         y: 'Horsepower',
                //                 //         color: {
                //                 //             value: 'red'
                //                 //         },
                //                 //         shape: {
                //                 //             value: 'line'
                //                 //         }
                //                 //     },
                //                 //     transition: {
                //                 //         disabled: true
                //                 //     }
                //                 // });
                //                 // propagateWith('actionName', fields)
                //                 // if no action name is provided then apply on all
                //         });
                //     });

                //     // centerMatrix = viz2.compositon.VisualGroup._layout._centerMatrix;
                //     // centerMatrix.forEach((rowMatrix) => {
                //     //     rowMatrix.forEach((cell) => {
                //     //         cell.unit.fireBolt &&
                //     //             // cell.unit.fireBolt.setPropagationFields(['Year']);
                //     //             cell.unit.fireBolt.onBehaviourDispatch('highlightRange',
                //     //                 behaviourCallback);
                //     //                 cell.unit.layerManager.addLayer({
                //     //                     mark: 'bar',
                //     //                     name: 'newlayer',
                //     //                     encoding: {
                //     //                         x: 'Origin',
                //     //                         y: 'Horsepower',
                //     //                         color: {
                //     //                             value: 'red'
                //     //                         }
                //     //                     },
                //     //                     transition: {
                //     //                         disabled: true
                //     //                     }
                //     //                 });
                //     //             // propagateWith('actionName', fields)
                //     //             // if no action name is provided then apply on all
                //     //     });
                //     // });

                //     // window.dataModel = rootData1.project(['Year', 'Horsepower']);
                //     let range = ['1970-01-01', '1971-01-01', '1972-01-01', '1973-01-01', '1974-01-01'];
                //     // @nice to have
                //     // fn = collector()
                //     // matrix.forEach((i, j) => fn(unit.firebold))
                //     // collector.run('dispatch', payload)
                //     //
                //     // Case 1
                //     // unit.fireBolt.dispatch('highlightRange', {
                //     //     criteria: {
                //     //         Year: range
                //     //     },
                //     //     callback: function (entrySet, exitSet) {
                //     //         this.operations.select(entrySet);
                //     //         this.operations.fade(exitSet);
                //     //     }
                //     // });

                //     // Case 2
                //     // unit.fireBolt.dispatch('select', {
                //     //     criteria: (dm) => {
                //     //         return dm.select((fields) => {
                //     //             return fields.Year.value === '1972-01-01';
                //     //         })
                //     //     },
                //     //     callback: function (entrySet, exitSet) {
                //     //         this.operations.select(entrySet);
                //     //         this.operations.fade(exitSet);
                //     //     }
                //     // });
                // }, 1000);
        }
        render();
    });
})();