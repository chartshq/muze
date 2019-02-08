/* eslint-disable */
const env = muze();
const DataModel = muze.DataModel;
window.dataSelect = muze.utils.dataSelect
d3.json('../../data/cars.json', (data) => {
    const jsonData = data;
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

    let rootData = new DataModel(jsonData, schema);
    rootData = rootData.groupBy(["Origin", "Year"], {
        Acceleration: "avg"
    })

    // env.canvas()
    //     .data(rootData)
    //     .rows(['Acceleration'])
    //     .columns(["Year"])
    //     .color("Origin")
    //     .height(500)
    //     .width(600)
    //     .title("Year wise average car Acceleration")
    //     .mount('#chart');

        createSelection = (sel, appendObj, data, idFn) => {
            let selection = sel || dataSelect(idFn);
        
            // data = [{ val: 0 }, { val: 1} ];
            selection = selection.data(data);
            // sdata = [{ val: 0 }, { val: 1} ]
            // exit=[];
            // selection.getObjects() => [{ val: 0 }, { val: 1} ]



            // data = [{ val: 1},{val:3} ];
            // selection2 = selection.data(data, idFn);
            // sdata=[{ val: 1},{val:3}]
            // exit=[{ val: 0 }]
            // selection.getObjects() => [{ val: 1},{val:3}]
        
            // "append-case-1":
            // append1 = selection.enter().append(appendObj);
            // append1.getObjects() => [Layer{ val: 0},Layer{val:1}]
            // exit=[];

            // "append-case-2"
            // append2 = selection2.enter().append(appendObj);
            // append1.getObjects() => [Layer{ val: 1},Layer{val:3}]
            // exit=[];


            // "merge-case-1":
            // merge1 = selection.merge(selection2)
            // merge.getObjects() => [{ val: 0 },{ val: 1},{val:3}]
            // exit=[];

            // "merge-case-2":
            // merge2 = appen1.merge(selection)
            // merge2.getObjects() => [Layer{ val: 0},Layer{val:1}]

            // "merge-case-3":
            // merge3 = selection.merge(append1)
            // merge3.getObjects() => [{ val: 0 }, { val: 1}]

            // "merge-case-4":
            // merge4 = appen1.merge(append2)
            // merge4.getObjects()=>[Layer{ val: 0},Layer{val:1},Layer{val:3}]






            const enter = selection.enter().append(appendObj);
            const mergedSelection = enter.merge(selection);
        
            selection.exit() && selection.exit().remove();
            return mergedSelection;
        };
        
        class Layer {
            constructor (d) {
                this.data = d;
            }
        
            remove () {
        
            }
        }

    let sel = null;
    sel = createSelection(sel, (d) => new Layer(d), [{ val: 0 }, { val: 1} ], (d) => d.val);
    console.log(sel.getObjects().map(d => d.data));

    // sel = createSelection(sel, (d) => new Layer(d), [{ val: 0 }, { val: 2} ], (d) => d.val);
    // console.log(sel.getObjects().map(d => d.data));

    // sel = createSelection(sel, (d) => new Layer(d), [{ val: 0 }, { val: 1},{ val: 2} ], (d) => d.val);
    // console.log(sel.getObjects().map(d => d.data));

    sel = createSelection(sel, (d) => new Layer(d), [{ val: 0 }], (d) => d.val);
    console.log(sel.getObjects().map(d => d.data));

});

