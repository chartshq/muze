/* global XMLHttpRequest */

const req = url =>
    new Promise((res, rej) => {
        const xhr = new XMLHttpRequest();
        xhr.open('GET', url);

        xhr.onload = () => res(JSON.parse(xhr.responseText));
        xhr.onerror = () => rej(xhr.statusText);
        xhr.send();
    });


const DataModel = window.DataModel.default;

let sdm;
let idm;
let udm;
let jdm;

async function exec () {
    const resp = await Promise.all(['/data/sprint_clean.json', '/data/issues_clean.json'].map(url => req(url)));
    const sprint = resp[0];
    const issues = resp[1];

    sdm = new DataModel(sprint, [
        { name: 'id', type: 'dimension' },
        { name: 'name', type: 'dimension' },
        { name: 'startDate', type: 'dimension', subtype: 'temporal' },
        { name: 'endDate', type: 'dimension', subtype: 'temporal' },
        { name: 'completeDate', type: 'dimension', subtype: '' },
        { name: 'goal', type: 'dimension' },
        { name: 'state', type: 'dimension' }
    ]);


    udm = sdm
        .project(['goal'], { mode: 'exclude' })

    udm.select(fields => fields.name.toString() === 'FSB Sprint 9', { mutationTarget: udm });
        // .calculateVariable({
        //     name: 'calc'
        // }, ['state', state => `${state}-ext`]);

    const data1 = [
        { id: 1, profit: 10, sales: 20, first: 'Hey', second: 'Jude' },
        { id: 2, profit: 20, sales: 25, first: 'Hey', second: 'Wood' },
        { id: 3, profit: 10, sales: 20, first: 'White', second: 'the sun' },
        { id: 4, profit: 15, sales: 25, first: 'White', second: 'walls' },
    ];
    const data2 = [
        { id: 1, netprofit: 100, netsales: 200, _first: 'Hello', _second: 'Jude' },
        { id: 4, netprofit: 200, netsales: 250, _first: 'Bollo', _second: 'Wood' },

    ];

    const schema1 = [
        {
            name: 'id',
            type: 'dimention'
        },
        {
            name: 'profit',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'sales',
            type: 'measure'
        },
        {
            name: 'first',
            type: 'dimension'
        },
        {
            name: 'second',
            type: 'dimension'
        },
    ];
    const schema2 = [
        {
            name: 'id',
            type: 'dimention'
        },
        {
            name: 'netprofit',
            type: 'measure',
            defAggFn: 'avg'
        },
        {
            name: 'netsales',
            type: 'measure'
        },
        {
            name: '_first',
            type: 'dimension'
        },
        {
            name: '_second',
            type: 'dimension'
        },
    ];
    const dataModel = new DataModel(data1, schema1);
    const dataModel2 = new DataModel(data2, schema2);
    let dm2 = dataModel.select(fields => fields.profit.value < 150);
    let dm3 = dataModel.groupBy(['sales'], {
        profit: null
    });
    let dm4 = dataModel.select(fields => fields.profit.value < 150, { saveChild: true, mutationTarget: dm2 });
    let dm5 = dataModel.groupBy(['Year'], {
    }, { saveChild: true, mutationTarget: dm3 });
    let dm6 = dataModel.calculateVariable({
        name: 'Efficiency'
    }, ['profit', 'sales', (profit, sales) => profit / sales]);
    let dm7 = dataModel.calculateVariable({
        name: 'UnEfficiency'
    }, ['sales', 'profit', (sales, profit) => sales / profit], { saveChild: true, mutationTarget: dm6 });
}

exec();