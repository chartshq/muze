/* global muze, d3 */

const env = muze();
const SpawnableSideEffect = muze.SideEffects.standards.SpawnableSideEffect;
const DataModel = muze.DataModel;

d3.csv('../data/bank.csv', (data) => {
    const schema = [
        {
            name: 'age',
            type: 'dimension'
        },
        {
            name: 'job',
            type: 'dimension'
        },
        {
            name: 'marital',
            type: 'dimension'
        },
        {
            name: 'education',
            type: 'dimension'
        },
        {
            name: 'balance',
            type: 'measure'
        }
    ];
    const env = muze();
    const DataModel = muze.DataModel;

    const rootData = new DataModel(data, schema);

    env.canvas()
                    .width(600).height(500).layers([{
                        mark: 'bar'
                    }]).rows(['balance']).columns(['age']).data(rootData.groupBy(['age', 'marital'], {
                        balance: 'min'
                    }).sort([['age']])).color('marital')
    .config({
        axes: {
            x: {
                tickFormat: val => `${val}sadasuiahdfoiuaGDFILUASBFIUasbdkausbdiaSBDLIAGSB`
            }
        }
    })
                    .mount('#chart');
});

                    // setTimeout(() => {
                    //     canvas.layers([{
                    //         mark: 'bar'
                    //     }]);
                    //     setTimeout(() => {
                    //         canvas.layers([{
                    //             mark: 'point',
                    //             encoding: {
                    //                 y: 'Horsepower',
                    //                 color: {
                    //                     value: '#000'
                    //                 }
                    //             }
                    //         }]);
                    //     }, 5000);
                    // }, 5000);
